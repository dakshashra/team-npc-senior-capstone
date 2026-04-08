import requests
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

def sync_nsf_to_firestore():
    # 1. Initialize Firebase
    if not firebase_admin._apps:
        sa_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    api_key = os.environ.get('GRANTS_API_KEY')
    api_url = "https://api.simpler.grants.gov/v1/opportunities/search"
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    
    # 2. Your updated payload (Added 'query' so it finds results)
    payload = {
        "query": "NSF", 
        "filters": {
            "opportunity_status": {"one_of": ["posted"]}
        },
        "pagination": {
            "page_offset": 1,
            "page_size": 25,
            "sort_order": [{"order_by": "post_date", "sort_direction": "descending"}]
        }
    }
    
    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=20)
        response.raise_for_status()
        items = response.json().get("data", [])
        print(f"✅ API Found {len(items)} opportunities.")
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # 3. Sync to 'funding' collection
    collection_ref = db.collection('funding')

    for opp in items:
        try:
            opp_id = str(opp.get('opportunity_id', 'unknown'))
            
            # Mapping fields exactly as you requested
            doc_data = {
                "title": opp.get('opportunity_title', 'No Title'),
                "link": f"https://www.grants.gov/search-results-detail/{opp_id}",
                "description": opp.get('description', 'No description provided.')[:1000],
                # Pulling the actual agency name from the API
                "source": opp.get('agency', 'Unknown Source'),
                # Storing the deadline exactly as a string
                "deadline": opp.get('close_date', 'N/A')
            }

            collection_ref.document(opp_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {doc_data['title']} from {doc_data['source']}")

        except Exception as e:
            print(f"⚠️ Error processing {opp.get('opportunity_title')}: {e}")

if __name__ == "__main__":
    sync_nsf_to_firestore()