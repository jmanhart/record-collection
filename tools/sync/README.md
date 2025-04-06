# **Record-Sync: Discogs to Supabase Sync Tool** 🎵🔄

This is a **standalone backend tool** that syncs your **Discogs record collection** with **Supabase**, ensuring your collection is always up-to-date with album details and cover images.

It was originally built as part of my **Astro portfolio site**, but it made more sense to break it out into its own dedicated app. Now, it **fetches Discogs records, downloads missing album covers, stores them in Supabase Storage, and updates the database**—all in a clean and modular way.

---

## **✨ Features**

✅ **Syncs records from Discogs** (handling pagination)  
✅ **Checks for missing records** before inserting new ones  
✅ **Downloads album cover images only if missing**  
✅ **Uploads images to Supabase Storage**  
✅ **Auto-updates the Supabase database** with the correct image URL  
✅ **Minimal debugging UI (optional)** for monitoring sync progress

---

## **🚀 Getting Started**

### **1️⃣ Clone the Repo**

```sh
git clone https://github.com/your-username/record-sync.git
cd record-sync
```

### **2️⃣ Install Dependencies**

```sh
npm install
```

### **3️⃣ Set Up Your `.env` File**

Create a `.env` file in the root directory with the following:

```ini
# Supabase Credentials
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Discogs API Credentials
DISCOGS_USER=your-discogs-username
PUBLIC_DISCOGS_API_TOKEN=your-discogs-api-token

# Server Config
PORT=3000
```

Make sure your **Supabase Service Role Key** is correct, as it's needed for writing data.

### **4️⃣ Run the Sync Tool**

To manually trigger a sync:

```sh
npm run fetch
```

This will:

- Fetch all records from Discogs.
- Download missing images.
- Upload them to Supabase Storage.
- Update the Supabase database.

### **5️⃣ (Optional) Start the Debugging UI**

If you set up a **simple frontend for debugging**, start the Express server:

```sh
npm start
```

Then open **http://localhost:3000** in your browser.

---

## **💂️ Project Structure**

```
record-sync/
├── src/
│   ├── utils/
│   │   ├── fetchDiscogs.ts       # Fetches records from Discogs API (pagination handled)
│   │   ├── updateSupabase.ts     # Upserts new records into Supabase
│   │   ├── downloadImages.ts     # Downloads and uploads missing images
│   │   ├── uploadImageToSupabase.ts # Handles image upload logic
│   │   ├── log.ts                # Centralized logging for easier debugging
│   ├── server.ts                 # (Optional) Express server for debugging
│   ├── public/                    # Debugging UI
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── script.js
├── .env                           # API keys and environment config
├── package.json                   # Dependencies and scripts
├── tsconfig.json                   # TypeScript config
└── README.md                       # This file
```

---

## **📌 How It Works**

### **1️⃣ Fetching Records**

- The script **fetches all records from Discogs**, handling **pagination**.
- It **checks which records are already in Supabase** and **only adds new ones**.

### **2️⃣ Handling Images**

- Before downloading an image, the script **checks if it already exists** in Supabase Storage.
- If the image is **missing**, it **downloads it from Discogs** and uploads it.

### **3️⃣ Database Updates**

- After processing, it **updates each record's `supabase_image_url`** field with the correct **Supabase Storage URL**.

---

## **Creating a table in Supabase**

```sql
CREATE TABLE public.records (
    id SERIAL PRIMARY KEY,
    release_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    supabase_image_url TEXT
);
```

Explanation of Columns:

- `id SERIAL PRIMARY KEY` → Auto-incrementing unique ID for each record.
- `release_id TEXT NOT NULL` → The Discogs release ID.
- `title TEXT NOT NULL` → Album title.
- `artist TEXT NOT NULL` → Artist name.
- `image_url TEXT` → URL to the album cover from Discogs.
- `created_at TIMESTAMP DEFAULT NOW()` → Timestamp when the record was added.
- `supabase_image_url TEXT` → URL of the image stored in Supabase (if applicable).

## **🛠️ Troubleshooting**

### **1️⃣ Images Not Showing?**

- **Double-check the Supabase Storage bucket settings** to ensure images are public.
- **Make sure the `supabase_image_url` field in your database is populated correctly**.

### **2️⃣ Sync Not Pulling New Records?**

- Run:

```sh
npm run fetch
```

- If it says `"✅ No new records to add."`, that means **everything is already up-to-date**.

### **3️⃣ Need to Reset?**

To **clear all images** and start fresh:

```sh
DELETE FROM records WHERE supabase_image_url IS NOT NULL;
```

Then, re-run the sync.

---

## **🎉 What's Next?**

✅ **Automate the sync with a CRON job**  
✅ **Add an admin UI to manually trigger syncs**  
✅ **Monitor logs via a simple dashboard**  
✅ **Expose a public API for fetching records**

---

## **📝 License**

MIT License. **Use, modify, and improve!** 🚀
