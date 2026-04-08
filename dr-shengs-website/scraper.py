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
            
            # --- The Fix: Extract first, then slice ---
            # 1. Get the value (defaulting to empty string if null)
            raw_summary = opp.get('summary') or "No description provided."
            # 2. Slice the string variable
            clean_description = str(raw_summary)[:1000] 

            # Pulling the other fields exactly as they are in the JSON
            agency_name = opp.get('agency_name') or "Unknown Agency"
            deadline_str = opp.get('close_date') or "N/A"

            doc_data = {
                "title": opp.get('opportunity_title', 'No Title'),
                "link": f"https://www.grants.gov/search-results-detail/{opp_id}",
                "description": clean_description,
                "source": agency_name,    # Displays the full agency name as-is
                "deadline": deadline_str, # Displays the raw date string as-is
                "last_updated": firestore.SERVER_TIMESTAMP
            }

            # Write to Firestore
            collection_ref.document(opp_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {doc_data['title']} (Agency: {agency_name})")

        except Exception as e:
            # This will help you identify if a specific record has weird data
            print(f"⚠️ Error processing item {opp.get('opportunity_id')}: {e}")

if __name__ == "__main__":
    sync_grants_to_firestore()