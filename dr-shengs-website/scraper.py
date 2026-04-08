import requests
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from dateutil import parser
from datetime import datetime

def sync_nsf_to_firestore():
    # 1. Initialize Firebase
    if not firebase_admin._apps:
        sa_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    
    # 2. Corrected Simpler Grants API Payload
    api_url = "https://api.simpler.grants.gov/v1/opportunities/search"
    
    # The 'pagination' object is REQUIRED by this API
    payload = {
        "query": "NSF",
        "filters": {
            "opportunity_status": {"one_of": ["posted"]},
            "agency": {"one_of": ["National Science Foundation"]}
        },
        "pagination": {
            "page_offset": 1,
            "page_size": 20,
            "sort_order": [
                {
                    "order_by": "post_date",
                    "sort_direction": "descending"
                }
            ]
        }
    }
    
    try:
        # Some endpoints require an API key in the header; 
        # if this fails with 401, you can get a free key at simpler.grants.gov
        headers = {"Content-Type": "application/json"}
        response = requests.post(api_url, json=payload, headers=headers, timeout=20)
        
        if response.status_code != 200:
            print(f"❌ API Error {response.status_code}: {response.text}")
            return

        data = response.json()
        items = data.get("data", [])
        print(f"🔎 API Found {len(items)} NSF opportunities.")
    except Exception as e:
        print(f"❌ Request Failed: {e}")
        return

    # 3. Sync to 'funding' collection
    collection_ref = db.collection('funding')

    for opp in items:
        try:
            # Map API fields to your specific Firestore structure
            title = opp.get('opportunity_title', 'No Title')
            opp_id = opp.get('opportunity_id', 'unknown')
            link = f"https://www.grants.gov/search-results-detail/{opp_id}"
            
            # Formatting the deadline for the "Blue Icon" Timestamp
            raw_deadline = opp.get('close_date')
            if raw_deadline:
                try:
                    # Parse string into Python datetime, then Firestore handles the rest
                    deadline_dt = parser.parse(raw_deadline)
                except:
                    deadline_dt = raw_deadline # Fallback to string if parse fails
            else:
                deadline_dt = "N/A"

            doc_data = {
                "title": title,
                "link": link,
                "description": opp.get('description', 'No description provided.')[:1000],
                "deadline": deadline_dt,
                "source": "NSF"
            }

            # Use Opportunity ID as document ID to prevent duplicates
            doc_id = str(opp_id)
            collection_ref.document(doc_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {title}")

        except Exception as e:
            print(f"⚠️ Error processing {opp.get('opportunity_title')}: {e}")

if __name__ == "__main__":
    sync_nsf_to_firestore()