import requests
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from dateutil import parser

def sync_nsf_to_firestore():
    # 1. Initialize Firebase
    if not firebase_admin._apps:
        sa_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    
    # 2. Get API Key from Environment
    api_key = os.environ.get('GRANTS_API_KEY')
    if not api_key:
        print("❌ ERROR: GRANTS_API_KEY is missing!")
        return

    api_url = "https://api.simpler.grants.gov/v1/opportunities/search"
    
    # Update Headers to include the Key
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    
    payload = {
        "query": "NSF",
        "filters": {
            "opportunity_status": {"one_of": ["posted"]},
            "agency": {"one_of": ["National Science Foundation"]}
        },
        "pagination": {
            "page_offset": 1,
            "page_size": 20,
            "sort_order": [{"order_by": "post_date", "sort_direction": "descending"}]
        }
    }
    
    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=20)
        response.raise_for_status()
        
        items = response.json().get("data", [])
        print(f"✅ Success! API Found {len(items)} opportunities.")
        
        # ... rest of your sync logic (same as before) ...
        collection_ref = db.collection('funding')
        for opp in items:
            opp_id = str(opp.get('opportunity_id', 'unknown'))
            doc_data = {
                "title": opp.get('opportunity_title'),
                "link": f"https://www.grants.gov/search-results-detail/{opp_id}",
                "description": opp.get('description', '')[:500],
                "deadline": parser.parse(opp.get('close_date')) if opp.get('close_date') else "N/A",
                "source": "NSF"
            }
            collection_ref.document(opp_id).set(doc_data, merge=True)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    sync_nsf_to_firestore()