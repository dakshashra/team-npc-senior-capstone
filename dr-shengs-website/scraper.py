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
    
    # 2. Use the Simpler Grants API (Federal Grant Database)
    # We filter specifically for "National Science Foundation" (NSF)
    api_url = "https://api.simpler.grants.gov/v1/opportunities/search"
    payload = {
        "query": "NSF",
        "filters": {
            "opportunity_status": {"one_of": ["posted"]},
            "agency": {"one_of": ["National Science Foundation"]}
        },
        "limit": 25 # Pulls the top 25 latest opportunities
    }
    
    try:
        # Note: This is a POST request as per the Simpler Grants API spec
        response = requests.post(api_url, json=payload, timeout=20)
        response.raise_for_status()
        data = response.json()
        items = data.get("data", [])
        print(f"🔎 API Found {len(items)} NSF opportunities.")
    except Exception as e:
        print(f"❌ API Request Failed: {e}")
        return

    # 3. Sync to 'funding' collection
    collection_ref = db.collection('funding')

    for opp in items:
        try:
            # Data Mapping from API fields
            title = opp.get('opportunity_title', 'No Title')
            link = f"https://www.grants.gov/search-results-detail/{opp.get('opportunity_id')}"
            description = opp.get('description', 'View link for details.')
            
            # Format the date for the "Blue Icon" in Firestore
            raw_deadline = opp.get('close_date', '')
            try:
                # Converts "2026-05-19" into a Firestore Timestamp
                clean_deadline = parser.parse(raw_deadline)
            except:
                clean_deadline = raw_deadline

            doc_data = {
                "title": title,
                "link": link,
                "description": description[:500] + "...", # Keep it concise
                "deadline": clean_deadline,
                "source": "NSF via Grants.gov"
            }

            # Use the unique Opportunity Number as the Document ID
            doc_id = opp.get('opportunity_number', title.replace(" ", "_")[:30])
            collection_ref.document(doc_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {title}")

        except Exception as e:
            print(f"⚠️ Error on item: {e}")

if __name__ == "__main__":
    sync_nsf_to_firestore()