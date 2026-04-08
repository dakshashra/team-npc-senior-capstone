import requests
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

def sync_grants_to_firestore():
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
    
    # 2. Payload optimized for the latest Simpler Grants API spec
    # A query is usually required to return relevant results
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
        
        response_data = response.json()
        items = response_data.get("data", [])
        print(f"✅ Success! API Found {len(items)} opportunities.")
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # 3. Sync to 'funding' collection
    collection_ref = db.collection('funding')

    for opp in items:
        try:
            # Document ID using the UUID provided by the API
            opp_id = str(opp.get('opportunity_id', 'unknown'))
            
            # Mapping fields based on the Simpler Grants API documentation
            doc_data = {
                "title": opp.get('opportunity_title', 'No Title'),
                "link": f"https://www.grants.gov/search-results-detail/{opp_id}",
                # The documentation lists 'summary' as the field for the opportunity overview
                "description": opp.get('summary', 'No summary provided.')[:1000],
                # 'agency_name' provides the full agency title (e.g., National Science Foundation)
                "source": opp.get('agency_name', 'Unknown Source'),
                # 'close_date' is the application deadline as a string (e.g., "2026-10-31")
                "deadline": opp.get('close_date', 'N/A'), 
                "last_updated": firestore.SERVER_TIMESTAMP
            }

            collection_ref.document(opp_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {doc_data['title']} from {doc_data['source']}")

        except Exception as e:
            print(f"⚠️ Error processing item: {e}")

if __name__ == "__main__":
    sync_grants_to_firestore()