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
            
            # --- 1. Extract Specific Fields ---
            # Using .get() ensures it doesn't crash if a field is missing
            eligibility = opp.get('applicant_eligibility_description') or "Eligibility info not provided."
            more_info_link = opp.get('additional_info_url') or "No additional link available."
            
            # --- 2. Create Clean Description ---
            # Combine the eligibility text and the link with a clean break
            clean_description = f"{eligibility}\n\nLink: {more_info_link}"

            # --- 3. Extract Deadline and Source ---
            # The snippet shows the key is 'close_date'
            deadline_str = opp.get('close_date') or "N/A"
            # Pulling the agency name directly
            agency_name = opp.get('agency_name', 'Unknown Source')

            doc_data = {
                "title": opp.get('opportunity_title', 'No Title'),
                "link": f"https://www.grants.gov/search-results-detail/{opp_id}",
                "description": clean_description,
                "source": agency_name,
                "deadline": deadline_str, # String format as requested
                "last_updated": firestore.SERVER_TIMESTAMP
            }

            # Write to Firestore
            collection_ref.document(opp_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {doc_data['title']} (Deadline: {deadline_str})")

        except Exception as e:
            print(f"⚠️ Error processing item {opp.get('opportunity_id')}: {e}")

if __name__ == "__main__":
    sync_grants_to_firestore()