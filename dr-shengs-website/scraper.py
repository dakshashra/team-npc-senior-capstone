import requests
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
import re

def strip_html(text):
    return re.sub(r'<[^>]+>', '', text or '').strip()

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

    # 2. Sync to 'funding' collection
    collection_ref = db.collection('funding')

    for opp in items:
        try:
            opp_id = str(opp.get('opportunity_id', 'unknown'))

            # The API nests most descriptive fields under a 'summary' sub-object
            summary = opp.get('summary') or {}

            # --- Agency ---
            agency_name = (
                opp.get('agency_name')
                or summary.get('agency_name')
                or 'Unknown Source'
            )

            # --- Deadline ---
            deadline_str = (
                summary.get('close_date')
                or opp.get('close_date')
                or "N/A"
            )

            # --- Eligibility (plain text only, no HTML) ---
            eligibility_raw = (
                summary.get('applicant_eligibility_description')
                or opp.get('applicant_eligibility_description')
                or "Eligibility info not provided."
            )
            clean_description = strip_html(eligibility_raw)

            # --- Award amounts ---
            award_floor = summary.get('award_floor') or opp.get('award_floor')
            award_ceiling = summary.get('award_ceiling') or opp.get('award_ceiling')

            # --- Link: prefer agency URL, fall back to grants.gov ---
            more_info_link = (
                summary.get('additional_info_url')
                or opp.get('additional_info_url')
                or f"https://www.grants.gov/search-results-detail/{opp_id}"
            )

            doc_data = {
                "title": opp.get('opportunity_title', 'No Title'),
                "link": more_info_link,
                "description": clean_description,
                "source": agency_name,
                "deadline": deadline_str,
                "award_floor": award_floor,
                "award_ceiling": award_ceiling,
                "opportunity_number": opp.get('opportunity_number', ''),
                "last_updated": firestore.SERVER_TIMESTAMP
            }

            collection_ref.document(opp_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {doc_data['title']} (Deadline: {deadline_str})")

        except Exception as e:
            print(f"⚠️ Error processing item {opp.get('opportunity_id')}: {e}")

if __name__ == "__main__":
    sync_grants_to_firestore()