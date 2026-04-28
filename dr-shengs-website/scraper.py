import requests
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
import re
from datetime import datetime

def strip_html(text):
    return re.sub(r'<[^>]+>', '', text or '').strip()

# ─────────────────────────────────────────
# GRANTS: sync NSF opportunities → 'funding'
# ─────────────────────────────────────────
# ─────────────────────────────────────────
# CONFERENCES: sync future CS conferences → 'conferences'
# ─────────────────────────────────────────
def sync_conferences_to_firestore(db):
    api_key = os.environ.get('PREDICTHQ_API_KEY')
    api_url = "https://api.predicthq.com/v1/events/"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }

    # Dynamically get today's date so it always fetches future events
    from datetime import datetime
    today_str = datetime.now().strftime("%Y-%m-%d")

    # Querying future tech/CS events
    params = {
        "q": "computer science OR software engineering OR artificial intelligence",
        "category": "conferences",
        "sort": "start",
        "active.gte": today_str,
        "limit": 20
    }

    try:
        response = requests.get(api_url, headers=headers, params=params, timeout=20)
        response.raise_for_status()
        events = response.json().get("results", [])
        print(f"✅ Conferences: Found {len(events)} events.")
    except Exception as e:
        print(f"❌ Conferences fetch error: {e}")
        return

    collection_ref = db.collection('conferences')

    for event in events:
        try:
            event_id = event.get('id', 'unknown')
            
            doc_data = {
                "title": event.get('title', 'No Title'),
                "description": event.get('description') or "No description provided.",
                "date": event.get('start', 'TBD'),  # PredictHQ returns ISO 8601 format
                "last_updated": firestore.SERVER_TIMESTAMP
            }

            collection_ref.document(event_id).set(doc_data, merge=True)
            print(f"📅 Synced conference: {doc_data['title']} (Date: {doc_data['date']})")

        except Exception as e:
            print(f"⚠️ Error processing conference {event.get('id')}: {e}")
def sync_grants_to_firestore(db):
    api_key = os.environ.get('GRANTS_API_KEY')
    api_url = "https://api.simpler.grants.gov/v1/opportunities/search"

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }

    payload = {
        "filters": {
            "opportunity_status": {"one_of": ["posted"]}
        },
        "pagination": {
            "page_offset": 1,
            "page_size": 40,
            "sort_order": [{"order_by": "post_date", "sort_direction": "descending"}]
        }
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=20)
        response.raise_for_status()
        response_data = response.json()
        items = response_data.get("data", [])
        print(f"✅ Grants: Found {len(items)} opportunities.")
    except Exception as e:
        print(f"❌ Grants error: {e}")
        return

    collection_ref = db.collection('funding')

    for opp in items:
        try:
            opp_id = str(opp.get('opportunity_id', 'unknown'))
            summary = opp.get('summary') or {}

            agency_name = opp.get('agency_name') or summary.get('agency_name') or 'Unknown Source'

            deadline_str = (
                summary.get('close_date')
                or opp.get('close_date')
                or "N/A"
            )

            eligibility_raw = (
                summary.get('applicant_eligibility_description')
                or opp.get('applicant_eligibility_description')
                or "Eligibility info not provided."
            )
            clean_description = strip_html(eligibility_raw)

            award_floor = summary.get('award_floor') or opp.get('award_floor')
            award_ceiling = summary.get('award_ceiling') or opp.get('award_ceiling')

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
            print(f"🚀 Synced grant: {doc_data['title']} (Deadline: {deadline_str})")

        except Exception as e:
            print(f"⚠️ Error processing grant {opp.get('opportunity_id')}: {e}")


# ─────────────────────────────────────────
# NEWS: replace 'news' collection with ~20 recent tech articles
# ─────────────────────────────────────────
def sync_news_to_firestore(db):
    api_key = os.environ.get('NEWS_API_KEY')
    url = (
        "https://newsapi.org/v2/top-headlines"
        f"?category=technology&language=en&pageSize=20&apiKey={api_key}"
    )

    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        articles = response.json().get("articles", [])
        print(f"✅ News: Found {len(articles)} articles.")
    except Exception as e:
        print(f"❌ News fetch error: {e}")
        return

    collection_ref = db.collection('news')

    # 1. Delete all existing documents in the collection
    existing_docs = collection_ref.stream()
    deleted = 0
    for doc in existing_docs:
        doc.reference.delete()
        deleted += 1
    print(f"🗑️  Deleted {deleted} old news documents.")

    # 2. Insert fresh articles
    for i, article in enumerate(articles):
        try:
            # Skip articles with missing core fields
            if not article.get('title') or article['title'] == '[Removed]':
                continue

            doc_data = {
                "title": article.get('title', 'No Title'),
                "summary": article.get('description') or article.get('content') or "No summary available.",
                "link": article.get('url', ''),
                "source": article.get('source', {}).get('name', 'Unknown'),
                "image_url": article.get('urlToImage', ''),
                "published_at": article.get('publishedAt', ''),
                "last_updated": firestore.SERVER_TIMESTAMP
            }

            # Use index as doc ID so ordering is stable
            collection_ref.document(str(i).zfill(2)).set(doc_data)
            print(f"📰 Added: {doc_data['title']}")

        except Exception as e:
            print(f"⚠️ Error processing article {i}: {e}")


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
def main():
    if not firebase_admin._apps:
        sa_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)

    db = firestore.client()

    sync_grants_to_firestore(db)
    sync_news_to_firestore(db)
    sync_conferences_to_firestore(db)

if __name__ == "__main__":
    main()