import requests
from bs4 import BeautifulSoup
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
        if not sa_json:
            print("❌ Secret FIREBASE_SERVICE_ACCOUNT is missing!")
            return
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    
    # 2. Fetch the HTML
    url = "https://new.nsf.gov/funding/opportunities"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"❌ Failed to fetch page: {e}")
        return

    # 3. Find the opportunities (NSF uses 'article' or specific card classes)
    # We look for elements that contain the titles and links
    items = soup.find_all(['article', 'div'], class_=lambda x: x and 'card' in x.lower())
    print(f"🔎 Found {len(items)} potential items on the page.")

    collection_ref = db.collection('funding')

    for item in items:
        try:
            # Title & Link
            link_tag = item.find('a')
            if not link_tag: continue
            
            title = link_tag.get_text(strip=True)
            link = "https://new.nsf.gov" + link_tag['href'] if link_tag['href'].startswith('/') else link_tag['href']
            
            # Description (often in a paragraph or specific summary class)
            desc_tag = item.find(['p', 'div'], class_=lambda x: x and 'summary' in x.lower())
            description = desc_tag.get_text(strip=True) if desc_tag else "No description available."

            # Deadline (NSF typically labels this in the card)
            deadline_text = "See Link"
            deadline_tag = item.find(text=lambda t: "Deadline" in t or "Due" in t)
            if deadline_tag:
                deadline_text = deadline_tag.strip()

            # Date Formatting for Firestore (Blue Calendar Icon)
            try:
                # Attempt to parse a date out of the text (e.g., "September 1, 2026")
                clean_deadline = parser.parse(deadline_text, fuzzy=True)
            except:
                clean_deadline = deadline_text # Fallback to string

            doc_data = {
                "title": title,
                "link": link,
                "description": description,
                "deadline": clean_deadline,
                "source": "NSF",
                "last_updated": firestore.SERVER_TIMESTAMP
            }

            # Create a unique ID from the URL to prevent duplicates
            doc_id = link.rstrip('/').split('/')[-1]
            collection_ref.document(doc_id).set(doc_data, merge=True)
            print(f"🚀 Synced: {title}")

        except Exception as e:
            print(f"⚠️ Skipping item due to error: {e}")

if __name__ == "__main__":
    sync_nsf_to_firestore()