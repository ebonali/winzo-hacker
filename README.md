# Color Trading Mastery — Secure eBook Platform

আল্ট্রা-প্রিমিয়াম ডিজিটাল বই বিক্রির প্ল্যাটফর্ম: Landing Page → Register/Login → USDT Payment → Admin Approval → Secure Online eBook Reader (watermark + copy/screenshot protection)।

## Security Architecture

```
User → Login (Supabase Auth)
     → Purchase ($49 USDT TRC20 + TxID জমা)
     → Admin Approve (server-verified)
     → book_access = active
     → Reader (প্রতিটি chapter request-এ server purchase verify করে)
```

- ❌ বইয়ের কনটেন্ট client bundle-এ নেই — `server/bookData.ts`-এ শুধু সার্ভারে থাকে
- ❌ PDF নেই, download নেই — chapter-by-chapter authenticated API দিয়ে render হয়
- ✅ Dynamic watermark: পাঠকের নাম + email + License ID, diagonal tiled
- ✅ Copy/select/right-click/print/keyboard shortcut block
- ✅ PrintScreen চাপলে clipboard wipe + warning
- ✅ Tab hidden/window blur হলে content blur
- ✅ Screenshot গুলো private Supabase Storage bucket-এ

## Setup (একবারই)

1. **Install**
   ```bash
   npm install
   ```

2. **Supabase project তৈরি করুন**
   - https://supabase.com/dashboard → New Project
   - SQL Editor → `supabase/schema.sql` ফাইলের পুরো content paste করে Run করুন

3. **`.env` ফাইল পূরণ করুন**
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — একই জায়গা থেকে
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — আপনার এডমিন credential
   - `GEMINI_API_KEY` — AI Assistant-এর জন্য (optional)

4. **Admin account তৈরি করুন**
   ```bash
   npm run setup-admin
   ```

5. **Run**
   ```bash
   npm run dev
   ```
   → http://localhost:3000

## Admin Flow

1. এডমিন email/password দিয়ে লগইন করুন → Navbar-এ "এডমিন ড্যাশবোর্ড" দেখাবে
2. **USDT অর্ডারসমূহ** ট্যাবে pending order দেখুন (TxID + screenshot সহ)
3. যাচাই করে **এপ্রুভ করুন** → ইউজারের রিডার instantly unlock
4. **পাঠকগণ** ট্যাব থেকে email দিয়ে manually permission দিতে/বাতিল করতে পারবেন

## User Flow

1. সাইন আপ / লগইন (email + password)
2. বই কিনুন → Checkout → TRC20 ওয়ালেটে $49 USDT পাঠিয়ে TxID জমা দিন
3. এডমিন অনুমোদনের পর Navbar-এ **ই-বুক রিডার** বাটন চালু হবে
4. রিডারে watermark সহ সুরক্ষিতভাবে বই পড়ুন

## Tech Stack

- Frontend: React 19 + Vite + Tailwind CSS 4
- Backend: Express (server.ts) + Supabase (PostgreSQL + Auth + Storage)
- Reader: react-markdown + custom protection layer
