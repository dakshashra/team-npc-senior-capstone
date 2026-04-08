import feedparser
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

def sync_nsf_to_firestore():
    # 1. Check if Service Account exists
    sa_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
    if not sa_json:
        print("❌ ERROR: FIREBASE_SERVICE_ACCOUNT environment variable is empty!")
        return

    # 2. Initialize Firebase
    if not firebase_admin._apps:
        try:
            cred_dict = json.loads(sa_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized successfully.")
        except Exception as e:
            print(f"❌ Firebase Init Error: {e}")
            return

    db = firestore.client()
    
    # 3. Fetch RSS Feed
    feed_url = "https://www.nsf.gov/rss/upcoming_due_dates.xml"
    feed = feedparser.parse(feed_url)
    
    print(f"🔎 Found {len(feed.entries)} entries in the NSF feed.")

    if len(feed.entries) == 0:
        print("⚠️ Warning: No entries found in RSS. Check the URL.")
        return

    # 4. Sync to 'funding' collection (to match your screenshot)
    collection_ref = db.collection('funding')

    for entry in feed.entries:
        try:
            # We use a slug of the link as the ID to prevent duplicates
            doc_id = entry.link.split('/')[-1] if '/' in entry.link else entry.title[:20]
            
            doc_data = {
                "title": entry.title,
                "link": entry.link,
                "description": entry.summary if 'summary' in entry else "No description",
                "deadline": entry.get('nsf_due_date', "N/A"), # The RSS tag for the date
                "source": "NSF",
                "last_updated": firestore.SERVER_TIMESTAMP
            }
            
            collection_ref.document(doc_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {entry.title}")
        except Exception as e:
            print(f"❌ Error syncing document {entry.title}: {e}")

if __name__ == "__main__":
    sync_nsf_to_firestore()