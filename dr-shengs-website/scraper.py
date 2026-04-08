import feedparser
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# 1. Initialize Firebase using environment variable (GitHub Secret)
if not firebase_admin._apps:
    service_account_info = json.loads(os.environ.get('FIREBASE_SERVICE_ACCOUNT'))
    cred = credentials.Certificate(service_account_info)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def sync_nsf_to_firestore():
    # NSF RSS Feed for upcoming deadlines
    feed_url = "https://www.nsf.gov/rss/upcoming_due_dates.xml"
    feed = feedparser.parse(feed_url)
    
    collection_ref = db.collection('funding_opportunities')

    for entry in feed.entries:
        # Data mapping
        doc_data = {
            "title": entry.title,
            "link": entry.link,
            "description": entry.summary if 'summary' in entry else "",
            "deadline": entry.get('nsf_due_date', "See link"), # NSF feed often has custom tags
            "source": "National Science Foundation",
            
        }
        
        # Use a slug or the link as a document ID to avoid duplicates
        doc_id = entry.link.split('/')[-1] or entry.title.replace(" ", "_")
        collection_ref.document(doc_id).set(doc_data, merge=True)
        print(f"Synced: {entry.title}")

if __name__ == "__main__":
    sync_nsf_to_firestore()