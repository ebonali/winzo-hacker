import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {
  CHAPTERS_DATA,
  BOOK_TITLE,
  BOOK_SUBTITLE,
  BOOK_PRICE_USDT,
  TRC20_WALLET_ADDRESS,
} from "./bookData";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ZINIPAY_API_KEY = process.env.ZINIPAY_API_KEY || "";
const APP_URL = process.env.APP_URL || "";
const BOOK_PRICE_BDT = 999;

// Service-role client: bypasses RLS. Only used on the server.
// Created lazily so the app can still serve static pages without Supabase configured.
let _supabase: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  }
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabase;
}

// middleware: reject DB-backed routes when Supabase is not configured
const supabaseGuard: express.RequestHandler = (_req, res, next) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(503).json({
      error: "সার্ভার Supabase দিয়ে কনফিগার করা হয়নি। .env ফাইলে SUPABASE_URL ও SUPABASE_SERVICE_ROLE_KEY সেট করুন।",
    });
    return;
  }
  next();
};

interface AuthedUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export async function createApp(): Promise<express.Express> {
  const app = express();

  app.use(express.json({ limit: "20mb" }));

  // DB-backed API routes require Supabase configuration
  app.use("/api/me", supabaseGuard);
  app.use("/api/orders", supabaseGuard);
  app.use("/api/book/chapter", supabaseGuard);
  app.use("/api/admin", supabaseGuard);

  // ---------- helpers ----------

  async function getAuthedUser(req: express.Request): Promise<AuthedUser | null> {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return null;

    const { data, error } = await sb().auth.getUser(token);
    if (error || !data?.user) return null;

    const { data: profile } = await sb()
      .from("profiles")
      .select("id, email, name, role")
      .eq("id", data.user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      role: profile.role === "admin" ? "admin" : "user",
    };
  }

  async function isAdmin(req: express.Request): Promise<AuthedUser | null> {
    const user = await getAuthedUser(req);
    if (!user || user.role !== "admin") return null;
    return user;
  }

  async function hasBookAccess(userId: string): Promise<boolean> {
    const { data } = await sb()
      .from("book_access")
      .select("status")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    return !!data;
  }

  // ---------- book settings & chapters (DB-backed, admin editable) ----------

  interface BookSettings {
    title: string;
    subtitle: string;
    priceUsdt: number;
    priceBdt: number;
    walletAddress: string;
  }

  async function getBookSettings(): Promise<BookSettings> {
    const fallback: BookSettings = {
      title: BOOK_TITLE,
      subtitle: BOOK_SUBTITLE,
      priceUsdt: BOOK_PRICE_USDT,
      priceBdt: BOOK_PRICE_BDT,
      walletAddress: TRC20_WALLET_ADDRESS,
    };
    try {
      const { data } = await sb().from("book_settings").select("*").eq("id", 1).maybeSingle();
      if (!data) return fallback;
      return {
        title: data.title || fallback.title,
        subtitle: data.subtitle || fallback.subtitle,
        priceUsdt: Number(data.price_usdt) || fallback.priceUsdt,
        priceBdt: Number(data.price_bdt) || fallback.priceBdt,
        walletAddress: data.wallet_address || fallback.walletAddress,
      };
    } catch {
      return fallback;
    }
  }

  async function getDbChapters(): Promise<any[] | null> {
    try {
      const { data } = await sb()
        .from("chapters")
        .select("*")
        .order("number", { ascending: true });
      if (!data || data.length === 0) return null;
      return data.map((c: any) => ({
        id: c.id,
        number: c.number,
        title: c.title,
        subtitle: c.subtitle || "",
        readTime: c.read_time || "",
        keyTakeaways: Array.isArray(c.key_takeaways) ? c.key_takeaways : [],
        content: c.content || "",
        hasInteractiveSimulator: !!c.has_interactive_simulator,
      }));
    } catch {
      return null;
    }
  }

  // ---------- health ----------
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Color Trading Mastery API" });
  });

  // ---------- public book meta (titles only — NO content) ----------
  app.get("/api/book/meta", async (_req, res) => {
    const settings = await getBookSettings();
    const chapters = (await getDbChapters()) ?? CHAPTERS_DATA;

    res.json({
      title: settings.title,
      subtitle: settings.subtitle,
      priceUsdt: settings.priceUsdt,
      priceBdt: settings.priceBdt,
      walletAddress: settings.walletAddress,
      totalChapters: chapters.length,
      chapters: chapters.map((c: any) => ({
        id: c.id,
        number: c.number,
        title: c.title,
        readTime: c.readTime,
        hasInteractiveSimulator: !!c.hasInteractiveSimulator,
      })),
    });
  });

  // ---------- me (profile + access + my orders) ----------
  app.get("/api/me", async (req, res) => {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const access = await hasBookAccess(user.id);
    const { data: orders } = await sb()
      .from("orders")
      .select("id, tx_id, amount_usdt, status, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    res.json({
      user,
      hasAccess: access || user.role === "admin",
      orders: (orders || []).map((o: any) => ({
        id: o.id,
        txId: o.tx_id,
        amountUsdt: o.amount_usdt,
        status: o.status,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      })),
    });
  });

  // ---------- submit order (USDT TxID + optional screenshot) ----------
  app.post("/api/orders", async (req, res) => {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: "অনুগ্রহ করে আগে লগইন করুন।" });

    if (await hasBookAccess(user.id)) {
      return res.status(400).json({ error: "আপনার ইতিমধ্যেই বইয়ের অ্যাক্সেস আছে।" });
    }

    const { txId, screenshot } = req.body || {};
    if (!txId || typeof txId !== "string" || txId.trim().length < 10) {
      return res.status(400).json({ error: "সঠিক TxID লিখুন (কমপক্ষে ১০ অক্ষর)।" });
    }

    // upload screenshot (base64 data URL) to private bucket
    let screenshotPath: string | null = null;
    if (screenshot && typeof screenshot === "string" && screenshot.startsWith("data:image/")) {
      try {
        const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(screenshot);
        if (!match) throw new Error("bad format");
        const contentType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        if (buffer.length > 10 * 1024 * 1024) {
          return res.status(400).json({ error: "স্ক্রিনশট ১০ MB এর কম হতে হবে।" });
        }
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        screenshotPath = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await sb().storage
          .from("payment-proofs")
          .upload(screenshotPath, buffer, { contentType, upsert: false });
        if (upErr) {
          console.error("Storage upload error:", upErr.message);
          screenshotPath = null;
        }
      } catch (e) {
        screenshotPath = null;
      }
    }

    const { data: order, error } = await sb()
      .from("orders")
      .insert({
        user_id: user.id,
        email: user.email,
        tx_id: txId.trim(),
        screenshot_path: screenshotPath,
        amount_usdt: (await getBookSettings()).priceUsdt,
        status: "pending",
      })
      .select("id, tx_id, amount_usdt, status, created_at")
      .single();

    if (error || !order) {
      console.error("Order insert error:", error?.message);
      return res.status(500).json({ error: "অর্ডার সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" });
    }

    res.status(201).json({
      order: {
        id: order.id,
        txId: order.tx_id,
        amountUsdt: order.amount_usdt,
        status: order.status,
        createdAt: order.created_at,
      },
    });
  });

  // delete own pending order (used when ZiniPay payment is cancelled)
  app.delete("/api/orders/:id", async (req, res) => {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    await sb()
      .from("orders")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", user.id)
      .eq("status", "pending");
    res.json({ ok: true });
  });

  // ================= ZINIPAY PAYMENT GATEWAY =================

  async function ziniApi(path: string, body: Record<string, unknown>) {
    const res = await fetch(`https://api.zinipay.com${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "zini-api-key": ZINIPAY_API_KEY },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || json?.status === false || json?.status === 'false') {
      console.error(`ZiniPay ${path} error:`, res.status, JSON.stringify(json).slice(0, 500));
    }
    return json;
  }

  // ---------- Promo codes ----------

  async function lookupPromo(codeRaw: string) {
    const code = String(codeRaw || "").trim().toUpperCase();
    if (!code) return { code, promo: null };
    const { data } = await sb()
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    return { code, promo: data || null };
  }

  function computePromoDiscount(promo: any, priceBdt: number, priceUsdt: number) {
    let discountBdt = 0;
    let discountUsdt = 0;
    if (promo.discount_type === "percent") {
      discountBdt = (priceBdt * Number(promo.discount_value)) / 100;
      discountUsdt = (priceUsdt * Number(promo.discount_value)) / 100;
    } else {
      discountBdt = Math.min(Number(promo.discount_value), priceBdt);
      discountUsdt = (priceUsdt / priceBdt) * discountBdt;
    }
    const finalBdt = Math.max(0, Math.round(priceBdt - discountBdt));
    const finalUsdt = Math.max(0, priceUsdt - discountUsdt);
    return { discountBdt, discountUsdt, finalBdt, finalUsdt };
  }

  interface PromoResult {
    error?: string;
    promo?: any;
    code?: string;
    discountBdt?: number;
    discountUsdt?: number;
    finalBdt?: number;
    finalUsdt?: number;
  }

  const applyPromoCode = async (codeRaw: string, priceBdt: number, priceUsdt: number): Promise<PromoResult> => {
    const { code, promo } = await lookupPromo(codeRaw);
    if (!promo) return { error: "প্রোমো কোডটি সঠিক নয়।" };
    if (!promo.active) return { error: "প্রোমো কোডটি এখন আর সচল নেই।" };
    if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) {
      return { error: "প্রোমো কোডটির সর্বোচ্চ ব্যবহার সীমা শেষ হয়ে গেছে।" };
    }
    const disc = computePromoDiscount(promo, priceBdt, priceUsdt);
    return { promo, code, ...disc };
  };

  // shared logic: mark order approved + grant reader access
  async function approveOrderAndGrantAccess(orderId: string, userId: string) {
    await sb()
      .from("orders")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    const { error } = await sb()
      .from("book_access")
      .upsert(
        {
          user_id: userId,
          order_id: orderId,
          status: "active",
          granted_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    return !error;
  }

  // create ZiniPay invoice for the logged-in user
  app.post("/api/payment/zinipay/create", supabaseGuard, async (req, res) => {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: "অনুগ্রহ করে আগে লগইন করুন।" });
    if (!ZINIPAY_API_KEY) {
      return res.status(503).json({ error: "ZiniPay configured নেই। .env-এ ZINIPAY_API_KEY সেট করুন।" });
    }

    // create local pending order first
    const settings = await getBookSettings();
    const promoRaw = req.body?.promoCode || "";
    const promoResult = promoRaw ? await applyPromoCode(promoRaw, Number(settings.priceBdt), Number(settings.priceUsdt)) : null;
    if (promoRaw && promoResult?.error) {
      return res.status(400).json({ error: promoResult.error });
    }

    const finalBdt = promoResult?.finalBdt ?? Number(settings.priceBdt);
    const finalUsdt = promoResult?.finalUsdt ?? Number(settings.priceUsdt);

    const { data: order, error: orderErr } = await sb()
      .from("orders")
      .insert({
        user_id: user.id,
        email: user.email,
        tx_id: "-",
        amount_usdt: finalUsdt,
        status: "pending",
        payment_method: "zinipay",
        promo_code: promoResult?.code || null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("ZiniPay order insert error:", orderErr?.message);
      return res.status(500).json({ error: "অর্ডার তৈরি করা যায়নি।" });
    }

    const baseUrl = APP_URL || `http://localhost:${process.env.PORT ? Number(process.env.PORT) : 3000}`;
    // Update order with correct priceUsdt from settings
    await sb()
      .from("orders")
      .update({ amount_usdt: finalUsdt })
      .eq("id", order.id);
    const invoice = await ziniApi("/v1/payment/create", {
      cus_name: user.name,
      cus_email: user.email,
      amount: finalBdt,
      metadata: { order_id: order.id, book: settings.title, promo_code: promoResult?.code || "" },
      redirect_url: `${baseUrl}/?zini_order=${order.id}`,
      cancel_url: `${baseUrl}/?zini_cancel=${order.id}`,
    }).catch((e: Error) => {
      console.error("ZiniPay create error:", e.message);
      return null;
    });

    if (!invoice?.status || !invoice?.payment_url) {
      await sb()
        .from("orders")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      return res.status(502).json({
        error: invoice?.message || "পেমেন্ট ইনভয়েস তৈরি করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
      });
    }

    // extract invoice id from payment_url (last segment)
    let invoiceId: string | null = null;
    try {
      invoiceId = new URL(invoice.payment_url).pathname.split("/").pop() || null;
    } catch {
      invoiceId = null;
    }
    if (invoiceId) {
      await sb().from("orders").update({ invoice_id: invoiceId }).eq("id", order.id);
    }

    res.json({ orderId: order.id, paymentUrl: invoice.payment_url });
  });

  // check/verify a ZiniPay payment; auto-grants access when COMPLETED
  app.post("/api/payment/zinipay/check", supabaseGuard, async (req, res) => {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: "অনুগ্রহ করে আগে লগইন করুন।" });
    if (!ZINIPAY_API_KEY) {
      return res.status(503).json({ error: "ZiniPay configured নেই।" });
    }

    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    const { data: order } = await sb()
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order) return res.status(404).json({ error: "অর্ডার পাওয়া যায়নি।" });
    if (order.status === "approved") return res.json({ status: "approved" });
    if (!order.invoice_id) return res.json({ status: order.status });

    const verify = await ziniApi("/v1/payment/verify", { invoice_id: order.invoice_id }).catch(
      (e: Error) => {
        console.error("ZiniPay verify error:", e.message);
        return null;
      }
    );

    const payStatus = String(verify?.status || "").toUpperCase();
    const known = ["COMPLETED", "PENDING", "FAILED"];
    if (!verify || !known.includes(payStatus)) {
      // unknown/errored response — keep the current order status
      return res.json({ status: order.status });
    }

    if (payStatus === "COMPLETED") {
      if (verify.transaction_id && typeof verify.transaction_id === "string") {
        await sb().from("orders").update({ tx_id: verify.transaction_id }).eq("id", order.id);
      }
      const ok = await approveOrderAndGrantAccess(order.id, user.id);
      if (!ok) return res.status(500).json({ error: "এক্সেস দেওয়া যায়নি।" });
      if (order.promo_code) {
        const { data: promoRow } = await sb()
          .from("promo_codes")
          .select("used_count")
          .eq("code", order.promo_code)
          .maybeSingle();
        await sb()
          .from("promo_codes")
          .update({ used_count: (promoRow?.used_count || 0) + 1 })
          .eq("code", order.promo_code);
      }
      return res.json({ status: "approved", transactionId: verify.transaction_id || null });
    }

    if (payStatus === "FAILED") {
      await sb()
        .from("orders")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      return res.json({ status: "rejected" });
    }

    return res.json({ status: "pending" });
  });

  // validate a promo code (no auth needed — but cheap; sandbox-safe)
  app.post("/api/promo/validate", async (_req, res) => {
    const codeRaw = _req.body?.code || "";
    const settings = await getBookSettings();
    const result = await applyPromoCode(codeRaw, Number(settings.priceBdt), Number(settings.priceUsdt));
    if (result.error) {
      return res.json({ valid: false, error: result.error });
    }
    res.json({
      valid: true,
      code: result.code,
      discountBdt: result.discountBdt,
      discountUsdt: result.discountUsdt,
      finalBdt: result.finalBdt,
      finalUsdt: result.finalUsdt,
    });
  });

  // ---------- protected chapter content ----------
  app.get("/api/book/chapter/:number", async (req, res) => {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized — লগইন করুন।" });

    const isAdminUser = user.role === "admin";
    if (!isAdminUser) {
      const access = await hasBookAccess(user.id);
      if (!access) {
        return res.status(403).json({ error: "Access Denied — আপনার এই বইটি পড়ার অনুমতি নেই।" });
      }
    }

    const number = parseInt(req.params.number, 10);
    const dbChapters = await getDbChapters();
    const chapter = (dbChapters ?? CHAPTERS_DATA).find((c: any) => c.number === number);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    // find the order that granted access (for watermark)
    let orderId: string | null = null;
    const { data: accessRow } = await sb()
      .from("book_access")
      .select("order_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (accessRow?.order_id) orderId = accessRow.order_id;

    res.json({
      chapter,
      watermark: {
        name: user.name,
        email: user.email,
        orderId: orderId || "ADMIN",
        licensedAt: new Date().toISOString(),
      },
    });
  });

  // ================= ADMIN ENDPOINTS =================

  // ---------- book management (settings + chapters) ----------
  app.get("/api/admin/book", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const settings = await getBookSettings();
    const chapters = (await getDbChapters()) ?? [];
    res.json({ settings, chapters });
  });

  app.put("/api/admin/book/settings", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const { title, subtitle, priceUsdt, priceBdt, walletAddress } = req.body || {};
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (title !== undefined && String(title).trim()) patch.title = String(title).trim();
    if (subtitle !== undefined) patch.subtitle = String(subtitle);
    if (priceUsdt !== undefined) {
      const n = Number(priceUsdt);
      if (!Number.isFinite(n) || n <= 0) return res.status(400).json({ error: "priceUsdt must be > 0" });
      patch.price_usdt = n;
    }
    if (priceBdt !== undefined) {
      const n = Number(priceBdt);
      if (!Number.isFinite(n) || n <= 0) return res.status(400).json({ error: "priceBdt must be > 0" });
      patch.price_bdt = n;
    }
    if (walletAddress !== undefined && String(walletAddress).trim()) {
      patch.wallet_address = String(walletAddress).trim();
    }

    const { error } = await sb().from("book_settings").update(patch).eq("id", 1);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ ok: true, message: "সেটিংস সংরক্ষণ হয়েছে।" });
  });

  // create or replace a chapter (upsert by number)
  app.post("/api/admin/book/chapters", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const { id, number, title, subtitle, readTime, keyTakeaways, content, hasInteractiveSimulator } = req.body || {};
    const num = Number(number);
    if (!Number.isInteger(num) || num < 1) {
      return res.status(400).json({ error: "অধ্যায় নম্বর সঠিক নয়।" });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "অধ্যায়ের শিরোনাম দিন।" });
    }

    const row: Record<string, unknown> = {
      number: num,
      title: String(title).trim(),
      subtitle: String(subtitle ?? ""),
      read_time: String(readTime ?? ""),
      key_takeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
      content: String(content ?? ""),
      has_interactive_simulator: !!hasInteractiveSimulator,
    };

    let result;
    if (id) {
      result = await sb().from("chapters").update(row).eq("id", id).select().single();
    } else {
      result = await sb().from("chapters").insert(row).select().single();
    }

    if (result.error) return res.status(500).json({ error: result.error.message });
    res.json({ ok: true, chapter: result.data });
  });

  app.delete("/api/admin/book/chapters/:id", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });
    const { error } = await sb().from("chapters").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  });

  app.get("/api/admin/orders", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const { data: orders, error } = await sb()
      .from("orders")
      .select(
        "id, tx_id, screenshot_path, amount_usdt, status, payment_method, created_at, updated_at, profiles(name, email)"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) return res.status(500).json({ error: error.message });

    const result = await Promise.all(
      (orders || []).map(async (o: any) => {
        let screenshotUrl: string | null = null;
        if (o.screenshot_path) {
          const { data } = await sb().storage
            .from("payment-proofs")
            .createSignedUrl(o.screenshot_path, 60 * 60);
          screenshotUrl = data?.signedUrl || null;
        }
        return {
          id: o.id,
          userName: o.profiles?.name || "",
          email: o.profiles?.email || o.email || "",
          txId: o.tx_id,
          screenshotUrl,
          amountUsdt: o.amount_usdt,
          paymentMethod: o.payment_method || "usdt",
          status: o.status,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
        };
      })
    );

    res.json({ orders: result });
  });

  app.post("/api/admin/orders/:id/approve", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const { data: order } = await sb()
      .from("orders")
      .select("id, user_id, status")
      .eq("id", req.params.id)
      .single();
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status === "approved") return res.json({ ok: true, message: "Already approved." });

    const ok = await approveOrderAndGrantAccess(order.id, order.user_id);
    if (!ok) return res.status(500).json({ error: "Access grant failed" });

    res.json({ ok: true, message: "Order approved, reader access granted." });
  });

  app.post("/api/admin/orders/:id/reject", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const { data: order } = await sb()
      .from("orders")
      .select("id, user_id, status, payment_method")
      .eq("id", req.params.id)
      .single();
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status === "rejected") return res.json({ ok: true, message: "Already rejected." });

    await sb()
      .from("orders")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    // revoke access if it was granted from this order
    await sb()
      .from("book_access")
      .update({ status: "revoked" })
      .eq("user_id", order.user_id)
      .eq("order_id", order.id);

    res.json({ ok: true, message: "Order rejected." });
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const { data: profiles, error } = await sb()
      .from("profiles")
      .select("id, email, name, role, created_at, book_access(status, order_id, granted_at)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      users: (profiles || []).map((p: any) => ({
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role,
        createdAt: p.created_at,
        hasAccess: p.role === "admin" || p.book_access?.status === "active",
      })),
    });
  });

  app.post("/api/admin/access/grant", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email required" });
    }

    const { data: profile } = await sb()
      .from("profiles")
      .select("id, email")
      .ilike("email", email.trim())
      .maybeSingle();

    if (!profile) {
      return res.status(404).json({ error: "এই email দিয়ে কোনো নিবন্ধিত account পাওয়া যায়নি।" });
    }

    const { error } = await sb()
      .from("book_access")
      .upsert(
        { user_id: profile.id, order_id: null, status: "active", granted_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) return res.status(500).json({ error: error.message });

    res.json({ ok: true, message: `Access granted to ${profile.email}` });
  });

  app.post("/api/admin/access/revoke", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const { userId } = req.body || {};
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId required" });
    }

    const { error } = await sb()
      .from("book_access")
      .update({ status: "revoked" })
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ ok: true, message: "Access revoked." });
  });

  app.get("/api/admin/stats", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const [ordersRes, usersRes, accessRes] = await Promise.all([
      sb().from("orders").select("status, amount_usdt, payment_method, created_at"),
      sb().from("profiles").select("id", { count: "exact", head: true }),
      sb().from("book_access").select("user_id").eq("status", "active"),
    ]);

    const orders = ordersRes.data || [];
    const approved = orders.filter((o: any) => o.status === "approved");
    const usdtApproved = approved.filter((o: any) => (o.payment_method || "usdt") === "usdt");
    const ziniApproved = approved.filter((o: any) => o.payment_method === "zinipay");
    const revenueUsdt = usdtApproved.reduce((sum: number, o: any) => sum + Number(o.amount_usdt || 0), 0);
    const revenueBdt = ziniApproved.length * BOOK_PRICE_BDT;

    // revenue by day (last 30 days)
    const byDay: Record<string, number> = {};
    for (const o of approved as any[]) {
      const day = (o.created_at || "").slice(0, 10);
      if (!day) continue;
      const val = o.payment_method === "zinipay" ? BOOK_PRICE_BDT : Number(o.amount_usdt || 0);
      byDay[day] = (byDay[day] || 0) + val;
    }

    res.json({
      totalOrders: orders.length,
      pendingOrders: orders.filter((o: any) => o.status === "pending").length,
      approvedOrders: approved.length,
      rejectedOrders: orders.filter((o: any) => o.status === "rejected").length,
      totalUsers: usersRes.count || 0,
      activeReaders: accessRes.data?.length || 0,
      revenueUsdt,
      revenueBdt,
      revenueByDay: byDay,
    });
  });

  // ---------- Admin: promo codes ----------
  app.get("/api/admin/promos", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });
    const { data, error } = await sb()
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ promos: data || [] });
  });

  app.post("/api/admin/promos", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });

    const code = String(req.body?.code || "").trim().toUpperCase();
    const discountType = String(req.body?.discountType || "").trim();
    const discountValue = Number(req.body?.discountValue);
    const maxUses = Number(req.body?.maxUses) || 0;

    if (!code) return res.status(400).json({ error: "Code required" });
    if (!["fixed", "percent"].includes(discountType)) {
      return res.status(400).json({ error: "discountType must be fixed or percent" });
    }
    if (!isFinite(discountValue) || discountValue <= 0) {
      return res.status(400).json({ error: "Invalid discount value" });
    }
    if (discountType === "percent" && discountValue > 100) {
      return res.status(400).json({ error: "Percent cannot exceed 100" });
    }

    const { data, error } = await sb()
      .from("promo_codes")
      .insert({ code, discount_type: discountType, discount_value: discountValue, max_uses: maxUses })
      .select("*")
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ promo: data });
  });

  app.patch("/api/admin/promos/:id", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });
    const { active, maxUses } = req.body || {};
    const updates: Record<string, unknown> = {};
    if (typeof active === "boolean") updates.active = active;
    if (maxUses !== undefined) updates.max_uses = Number(maxUses) || 0;
    const { error } = await sb().from("promo_codes").update(updates).eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  });

  app.delete("/api/admin/promos/:id", async (req, res) => {
    if (!(await isAdmin(req))) return res.status(403).json({ error: "Admin only" });
    const { error } = await sb().from("promo_codes").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  });

  // ---------- Server-side Gemini AI Chat endpoint ----------
  const aiRateLimit = new Map<string, number>();
  app.post("/api/ai/ask", async (req, res) => {
    try {
      const user = await getAuthedUser(req);
      if (!user) return res.status(401).json({ error: "অনুগ্রহ করে আগে লগইন করুন।" });

      // simple rate limit: 10 requests per minute per user
      const now = Date.now();
      const lastReq = aiRateLimit.get(user.id) || 0;
      if (now - lastReq < 6000) {
        return res.status(429).json({ error: "অনেক বেশি অনুরোধ পাঠাচ্ছেন। ৬ সেকেন্ড অপেক্ষা করুন।" });
      }
      aiRateLimit.set(user.id, now);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is not configured.",
        });
      }

      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are the official AI Assistant for "Color Trading Mastery" - the world's premier digital trading book authored for professional traders.
Your knowledge includes:
- Color Bar Analysis: Red/Green candle patterns, color transition signals, momentum volume confirmation.
- Trading Psychology: Eliminating FOMO, sticking to trade plans, managing emotional drawdowns.
- Risk & Money Management: 1-2% account risk rule, position sizing formulas, R:R ratios (1:3+ target).
- Platform & Access: The book costs $49 USDT (TRC20 Binance). Access is verified via TxID upload and Admin approval.
- Be extremely encouraging, professional, precise, and structured. Use markdown where helpful.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }] }
        ]
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to query AI Assistant" });
    }
  });

  // catch-all error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", err?.message || err);
    res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" });
  });

  // Vite middleware for dev / static files for local production mode.
  // On Vercel, static serving + SPA fallback is handled by vercel.json rewrites.
  if (process.env.VERCEL) {
    // serverless: nothing to serve statically
  } else if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}
