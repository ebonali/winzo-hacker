const fs = require('fs');

// HomePage
let s = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');
s = s.replace(
  'const { navigate } = useStore();',
  'const { navigate, bookMeta } = useStore();\n  const priceUsdt = bookMeta?.priceUsdt ?? BOOK_PRICE_USDT;\n  const priceBdt = bookMeta?.priceBdt ?? 999;'
);
s = s.split('{BOOK_PRICE_USDT}$ /').join('{priceUsdt}$ /');
s = s.split('৯৯৯৳').join('{priceBdt}৳');
s = s.split('$49 USDT').join('${priceUsdt} USDT');
s = s.split('($49)').join('(${priceUsdt})');
fs.writeFileSync('src/pages/HomePage.tsx', s, 'utf8');
console.log('home: priceBdt refs', (s.match(/priceBdt/g) || []).length, '| literal 999 left:', s.includes('৯৯৯'));

// BuyBookPage
let b = fs.readFileSync('src/pages/BuyBookPage.tsx', 'utf8');
b = b.replace(
  'const { navigate } = useStore();',
  'const { navigate, bookMeta } = useStore();\n  const priceUsdt = bookMeta?.priceUsdt ?? BOOK_PRICE_USDT;\n  const priceBdt = bookMeta?.priceBdt ?? BOOK_PRICE_BDT;'
);
b = b.split('{BOOK_PRICE_BDT}৳').join('{priceBdt}৳');
b = b.split('${BOOK_PRICE_USDT}').join('${priceUsdt}');
fs.writeFileSync('src/pages/BuyBookPage.tsx', b, 'utf8');
console.log('buybook done');

// CheckoutPage
let c = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');
c = c.replace(
  "const { currentUser, navigate, showToast, refreshMe, myOrders } = useStore();",
  "const { currentUser, navigate, showToast, refreshMe, myOrders, bookMeta } = useStore();\n  const priceUsdt = bookMeta?.priceUsdt ?? BOOK_PRICE_USDT;\n  const priceBdt = bookMeta?.priceBdt ?? BOOK_PRICE_BDT;"
);
c = c.split('{BOOK_PRICE_BDT}৳').join('{priceBdt}৳');
c = c.split('${BOOK_PRICE_USDT}').join('${priceUsdt}');
fs.writeFileSync('src/pages/CheckoutPage.tsx', c, 'utf8');
console.log('checkout done');

// LoginPage uses no price. Done.
