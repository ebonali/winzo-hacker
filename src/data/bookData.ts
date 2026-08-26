import { Testimonial, FAQItem } from '../types';

// NOTE: Book chapter content lives SERVER-SIDE only (server/bookData.ts).
// The client never receives chapter content until the server verifies purchase access.

export const BOOK_TITLE = "WINGO HACKER (জিরো থেকে এডভান্স)";
export const BOOK_SUBTITLE = "কালার ট্রেডিং এ আর লস নয়, মার্কেট বুঝে ট্রেড করুন — লেখক: Guru Analysis";
export const BOOK_PRICE_USDT = 49;
export const BOOK_PRICE_BDT = 999;
export const TRC20_WALLET_ADDRESS = "TQ9xZ8m1uK2v9XpL4wN7yR3mJ8sF1dQ5zA";

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "t1",
    name: "তানভীর আহমেদ",
    role: "ফুল-টাইম ট্রেডার (ঢাকা)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    content: "WINGO HACKER বইটি পড়ার পর আমার গেম ট্রেডিং দৃষ্টিভঙ্গি পুরোপুরি বদলে গেছে! ভুয়া সিগন্যাল গ্রুপ ছেড়ে এখন ৭-স্টেপ মার্টিংগেল ও রিস্ক ম্যানেজমেন্ট নিয়ম মেনে চলছি।",
    profitGain: "৯০% সিওর শট প্যাটার্ন"
  },
  {
    id: "t2",
    name: "শারমিন সুলতানা",
    role: "কমিউনিটি মেম্বার (চট্টগ্রাম)",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    content: "অধ্যায় ১২ এর কম্বিনেশন চার্ট ও অধ্যায় ৭ এর ১% মানি ম্যানেজমেন্ট রুলস অসাধারণ! USDT দিয়ে ই-বুকটি কেনার ২ মিনিটের মধ্যে পড়ার এক্সেস পেয়েছি।",
    profitGain: "১৫% দৈনিক টার্গেট অর্জন"
  },
  {
    id: "t3",
    name: "মাহমুদুল হাসান",
    role: "প্রপ ট্রেডার (সিলেট)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    content: "গুরু অ্যানালাইসিসের লেখা এই গাইডটি রিয়েল আই ওপেনার! 'Higher Bet = Loss' এবং ডেমো অ্যাকাউন্টের প্রতারণা জানার পর থেকে অনেক বড় লস থেকে বেঁচে গিয়েছি।",
    profitGain: "সুরক্ষিত মূলধন"
  },
  {
    id: "t4",
    name: "রাফিদ চৌধুরী",
    role: "স্মার্ট অ্যানালিস্ট (রাজশাহী)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    content: "বইটির চ্যাপ্টারগুলো খুব নিখুঁতভাবে বাংলা ভাষায় সাজানো। অনলাইন ই-বুক রিডারে ডার্ক মোডে পড়ার অভিজ্ঞতাও দারুণ।",
    profitGain: "উইন পার্সেন্টেজ বৃদ্ধি"
  }
];

export const FAQS_DATA: FAQItem[] = [
  {
    category: "সাধারণ প্রশ্নাবলি",
    question: "USDT পেমেন্ট করার পর কীভাবে বইটি পড়ার এক্সেস পাব?",
    answer: "আমাদের ট্রন (TRC20) ওয়ালেটে $49 USDT (বা ১০৯৯ টাকা সমপরিমাণ) পাঠানোর পর চেকআউট পেজে আপনার জিমেইল ও পেমেন্ট ট্রানজেকশন আইডি (TxID) জমা দিন। আমাদের এডমিন প্যানেল ভেরিফাই করে তাৎক্ষণিকভাবে আপনার জিমেইল এক্সেস আনলক করে দেবে।"
  },
  {
    category: "সাধারণ প্রশ্নাবলি",
    question: "WINGO HACKER বইটি কি নতুনদের জন্য সহজবোধ্য?",
    answer: "হ্যাঁ! বইটি একদম শুরু (জিরো) থেকে শুরু করে Wingo Lottery-র পরিচিতি, মৌলিক কাঠামো, ১-৯ সংখ্যার বিশ্লেষণ, প্রফেশনাল চার্ট এবং এডভান্স মানি ম্যানেজমেন্ট বিস্তারিত বাংলা ভাষায় শেখায়।"
  },
  {
    category: "পেমেন্ট সংক্রান্ত",
    question: "পেমেন্টের জন্য কোন নেটওয়ার্ক ব্যবহৃত হয়?",
    answer: "আমরা বাইনান্স বা যেকোনো ক্রিপ্টো ওয়ালেট থেকে USDT (TRC20 Tron Network) গ্রহণ করি। এতে কম ফি ও দ্রুত ভেরিফিকেশন সম্পন্ন হয়।"
  },
  {
    category: "পড়া ও ব্যবহার",
    question: "বইটি কীভাবে পড়া যাবে?",
    answer: "আপনি আমাদের অনলাইন ই-বুক রিডারে লাইফটাইম এক্সেস পাবেন, যেখানে রয়েছে ১৫টি পূর্ণাঙ্গ অধ্যায়, চ্যাপ্টার প্রোগ্রেস ট্র্যাকার, ডার্ক মোড এবং ইন্টারঅ্যাক্টিভ সিমুলেটর।"
  },
  {
    category: "সহায়তা",
    question: "ডিপোজিট বা উইথড্রয়ালে সমস্যা হলে করণীয় কী?",
    answer: "বইটির অধ্যায় ১৩-তে কাস্টমার সাপোর্টে টিকিট দেওয়ার সুনির্দিষ্ট তথ্য ও ফরমেট রয়েছে। এছাড়াও আমাদের সাপোর্ট পেজ থেকে সরাসরি মেসেজ দিতে পারেন।"
  }
];
