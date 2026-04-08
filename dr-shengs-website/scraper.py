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
            # Document ID from the API UUID
            opp_id = str(opp.get('opportunity_id', 'unknown'))
            
            # --- Safety Check for Description ---
            # Using .get() ensures no crash if 'summary' is missing.
            # Adding 'or ""' ensures that even if it's None (null), it becomes a string.
            raw_summary = opp.get('summary') or "No description provided."
            # Now we slice the string safely
            clean_description = raw_summary[:1000]

            doc_data = {
                "title": opp.get('opportunity_title', 'No Title'),
                "link": f"https://www.grants.gov/search-results-detail/{opp_id}",
                "description": clean_description,
                # Pulling agency_name exactly as-is
                "source": opp.get('agency_name', 'Unknown Source'),
                # Pulling close_date exactly as-is (string)
                "deadline": opp.get('close_date', 'N/A'), 
                "last_updated": firestore.SERVER_TIMESTAMP
            }

            collection_ref.document(opp_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {doc_data['title']}")

        except Exception as e:
            # This will now catch and print the specific error for each item
            print(f"⚠️ Error processing item {opp.get('opportunity_id')}: {e}")

if __name__ == "__main__":
    sync_grants_to_firestore()