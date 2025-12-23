console.log('POS PlayTime app.js v5 - loaded');
/* POS PlayTime App */

// ---- Storage keys ----
const LS_CART_KEY     = 'posplaytime.cart';
const LS_HISTORY_KEY  = 'posplaytime.history';
const LS_ITEMS_KEY    = 'posplaytime.items';
const LS_PASSCODE_KEY = 'posplaytime.passcode';
const SESSION_ADMIN_KEY = 'posplaytime.adminAuthed';

const TAX_RATE = 0.05; // 5%

// ---- Default pub-style items ----
const DEFAULT_ITEMS = [
  { id: 'fries',       emoji: '🍟', name: 'Fries',             price: 3.00, category: 'Appetizers' },
  { id: 'sticks',      emoji: '🧀', name: 'Mozzarella Sticks', price: 4.50, category: 'Appetizers' },
  { id: 'wings',       emoji: '🍗', name: 'Wings',             price: 6.00, category: 'Appetizers' },
  { id: 'buns',        emoji: '🥖', name: 'Buns',              price: 3.25, category: 'Appetizers' },
  { id: 'hashbrowns',  emoji: '🥔', name: 'Hashbrowns',        price: 2.25, category: 'Appetizers' },
  { id: 'burger',      emoji: '🍔', name: 'Burger',            price: 6.00, category: 'Mains' },
  { id: 'hotdog',      emoji: '🌭', name: 'Hot Dog',           price: 5.00, category: 'Mains' },
  { id: 'pizza',       emoji: '🍕', name: 'Pizza Slice',       price: 3.50, category: 'Mains' },
  { id: 'noodles',     emoji: '🍝', name: 'Noodles',           price: 5.50, category: 'Mains' },
  { id: 'friedegg',    emoji: '🥚', name: 'Fried Egg',         price: 3.50, category: 'Mains' },
  { id: 'bacon',       emoji: '🥓', name: 'Bacon',             price: 3.00, category: 'Mains' },
  { id: 'ham',         emoji: '🍖', name: 'Ham',               price: 3.50, category: 'Mains' },
  { id: 'pop',         emoji: '🥤', name: 'Pop',               price: 1.25, category: 'Drinks' },
  { id: 'water',       emoji: '🫗', name: 'Water',             price: 0.10, category: 'Drinks' },
  { id: 'juice',       emoji: '🧃', name: 'Juice',             price: 1.50, category: 'Drinks' },
  { id: 'milk',        emoji: '🥛', name: 'Milk',              price: 1.20, category: 'Drinks' },
  { id: 'coffee',      emoji: '☕', name: 'Coffee',            price: 1.20, category: 'Drinks' },
  { id: 'icecream',    emoji: '🍦', name: 'Ice Cream',         price: 2.50, category: 'Desserts' },
  { id: 'cupcake',     emoji: '🧁', name: 'Cupcake',           price: 2.00, category: 'Desserts' },
  { id: 'cookie',      emoji: '🍪', name: 'Cookie',            price: 1.50, category: 'Desserts' },
  { id: 'gummyb',      emoji: '🧸', name: 'Gummy Bears',       price: 3.00, category: 'Candy' },
  { id: 'fuzzyp',      emoji: '🍑', name: 'Fuzzy Peaches',     price: 1.00, category: 'Candy' },
  { id: 'chocolate',   emoji: '🍫', name: 'Chocolate',         price: 3.00, category: 'Candy' }
];

// ---- Helpers ----
const currency = (n) => `$${n.toFixed(2)}`;

function loadItems() {
  try {
    const fromLS = JSON.parse(localStorage.getItem(LS_ITEMS_KEY));
    return Array.isArray(fromLS) && fromLS.length ? fromLS : DEFAULT_ITEMS.slice();
  } catch {
    return DEFAULT_ITEMS.slice();
  }
}
function saveItems(items) {
  localStorage.setItem(LS_ITEMS_KEY, JSON.stringify(items));
}

function getPasscode() {
  const val = localStorage.getItem(LS_PASSCODE_KEY);
  return val && val.length ? val : '1234'; // default
}

// ---- State ----
let ITEMS = loadItems();
let CATEGORIES = [...new Set(ITEMS.map(i => i.category))];
let activeCategory = CATEGORIES[0] || 'Appetizers';
let cart = []; // {id, emoji, name, price, qty}

// ---- Elements ----
const tabsEl = document.getElementById('categoryTabs');
const gridEl = document.getElementById('itemGrid');
const cartListEl = document.getElementById('cartList');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const payBtn = document.getElementById('payBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const historyDialog = document.getElementById('historyDialog');
const historyListEl = document.getElementById('historyList');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportBtn = document.getElementById('exportBtn');
const menuBtn = document.getElementById('menuBtn');
const adminBtn = document.getElementById('adminBtn');
const adminDialog = document.getElementById('adminDialog');
const passcodeInput = document.getElementById('passcodeInput');
const cancelAdminBtn = document.getElementById('cancelAdminBtn');
const submitAdminBtn = document.getElementById('submitAdminBtn');
const paySound = document.getElementById('paySound');
const confettiContainer = document.getElementById('confettiContainer');

// ---- Storage for cart/history ----
function loadCart() {
  try { cart = JSON.parse(localStorage.getItem(LS_CART_KEY)) || []; } catch { cart = []; }
}
function saveCart() {
  localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY_KEY)) || []; } catch { return []; }
}
function saveHistory(history) {
  localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(history));
}

// ---- Effects ----
function playChaChing() {
  if (!paySound) return;
  try {
    paySound.currentTime = 0;
    paySound.play().catch(() => {});
  } catch {}
}

function launchConfetti() {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#e964ff','#f97316','#22c55e'];
  const pieces = 120;

  confettiContainer.innerHTML = '';
  for (let i = 0; i < pieces; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.backgroundColor = colors[i % colors.length];
    dot.style.width = (6 + Math.random() * 8) + 'px';
    dot.style.height = (10 + Math.random() * 10) + 'px';
    dot.style.opacity = 0.8 + Math.random() * 0.2;
    dot.style.animation = `confettiFall ${2.5 + Math.random()*1.5}s cubic-bezier(.25,.7,.5,1) forwards`;
    dot.style.transform = `rotate(${Math.floor(Math.random()*360)}deg)`;
    dot.style.animationDelay = (Math.random() * 0.6) + 's';
    confettiContainer.appendChild(dot);
  }
  setTimeout(() => { confettiContainer.innerHTML = ''; }, 4000);
}

// ---- Render ----
function renderTabs() {
  CATEGORIES = [...new Set(ITEMS.map(i => i.category))];
  if (!CATEGORIES.length) CATEGORIES = ['Appetizers'];
  if (!CATEGORIES.includes(activeCategory)) activeCategory = CATEGORIES[0];

  tabsEl.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = cat === activeCategory ? 'active' : '';
    btn.onclick = () => { activeCategory = cat; renderGrid(); renderTabs(); };
    tabsEl.appendChild(btn);
  });
}

function renderGrid() {
  gridEl.innerHTML = '';
  const items = ITEMS.filter(i => i.category === activeCategory);
  items.forEach(item => {
    const tile = document.createElement('button');
    tile.className = 'tile';
    tile.setAttribute('aria-label', `Add ${item.name} to order`);
    tile.onclick = () => addToCart(item);

    const emoji = document.createElement('div');
    emoji.className = 'emoji';
    emoji.textContent = item.emoji;

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = item.name;

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = currency(item.price);

    tile.append(emoji, name, price);
    gridEl.appendChild(tile);
  });
}

function renderCart() {
  cartListEl.innerHTML = '';
  cart.forEach(line => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${line.emoji} ${line.name} ×${line.qty}</span>
      <span>${currency(line.qty * line.price)}
        <button aria-label="Remove one ${line.name}">🗑</button>
      </span>`;
    li.querySelector('button').onclick = () => removeOne(line.id);
    cartListEl.appendChild(li);
  });

  const subtotal = cart.reduce((sum, l) => sum + l.qty * l.price, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  subtotalEl.textContent = currency(subtotal);
  taxEl.textContent = currency(tax);
  totalEl.textContent = currency(total);
}

// ---- Cart operations ----
function addToCart(item) {
  const existing = cart.find(l => l.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ id: item.id, emoji: item.emoji, name: item.name, price: item.price, qty: 1 });
  saveCart();
  renderCart();
}
function removeOne(id) {
  const idx = cart.findIndex(l => l.id === id);
  if (idx >= 0) {
    cart[idx].qty -= 1;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
    renderCart();
  }
}
function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

// ---- Payment & History ----
function pay() {
  if (cart.length === 0) return;

  const subtotal = cart.reduce((sum, l) => sum + l.qty * l.price, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const order = {
    id: 'ORD-' + Date.now(),
    at: new Date().toISOString(),
    items: cart.map(l => ({ id: l.id, emoji: l.emoji, name: l.name, qty: l.qty, price: l.price })),
    subtotal: +subtotal.toFixed(2),
    tax,
    total
  };
  const history = loadHistory();
  history.unshift(order);
  saveHistory(history);

  // Effects!
  playChaChing();
  launchConfetti();

  clearCart();
  showHistory();
}

function showHistory() {
  const history = loadHistory();
  historyListEl.innerHTML = '';
  if (history.length === 0) {
    historyListEl.textContent = 'No orders yet.';
  } else {
    history.forEach(o => {
      const wrap = document.createElement('div');
      wrap.className = 'order';
      const when = new Date(o.at).toLocaleString();
      const linesHtml = o.items.map(i => {
        const lineTotal = (i.qty * i.price).toFixed(2);
        return `<li>${i.emoji} ${i.name} ×${i.qty} — $${lineTotal}</li>`;
      }).join('');
      wrap.innerHTML = `
        <h4>${o.id} — ${when}</h4>
        <ul>${linesHtml}</ul>
        <p><strong>Subtotal:</strong> $${o.subtotal.toFixed(2)}</p>
        <p><strong>Tax (5%):</strong> $${o.tax.toFixed(2)}</p>
        <p><strong>Total:</strong> $${o.total.toFixed(2)}</p>
      `;
      historyListEl.appendChild(wrap);
    });
  }
  historyDialog.showModal();
}

function clearHistory() {
  if (confirm('Clear all order history?')) {
    saveHistory([]);
    showHistory();
  }
}

function exportCSV() {
  const history = loadHistory();
  const rows = [['Order ID','Date','Item','Qty','Price','Line Total','Subtotal','Tax','Total']];
  history.forEach(o => {
    o.items.forEach(i => {
      rows.push([
        o.id,
        new Date(o.at).toLocaleString(),
        `${i.emoji} ${i.name}`,
        i.qty,
        i.price.toFixed(2),
        (i.qty * i.price).toFixed(2),
        o.subtotal.toFixed(2),
        o.tax.toFixed(2),
        o.total.toFixed(2)
      ]);
    });
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pos-playtime-history.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Admin gate (passcode) ----
function openAdminGate() {
  passcodeInput.value = '';
  adminDialog.showModal();
  passcodeInput.focus();
}
function tryUnlockAdmin() {
  const code = passcodeInput.value.trim();
  if (code === getPasscode()) {
    sessionStorage.setItem(SESSION_ADMIN_KEY, 'true');
    adminDialog.close();
    window.location.href = 'admin.html';
  } else {
    passcodeInput.classList.add('shake');
    setTimeout(() => passcodeInput.classList.remove('shake'), 350);
    passcodeInput.value = '';
    passcodeInput.focus();
  }
}

// ---- Wire up ----
payBtn.onclick = pay;
clearCartBtn.onclick = clearCart;
viewHistoryBtn.onclick = showHistory;
closeHistoryBtn.onclick = () => historyDialog.close();
clearHistoryBtn.onclick = clearHistory;
exportBtn.onclick = exportCSV;

adminBtn.onclick = openAdminGate;
menuBtn.onclick = () => { window.location.href = 'menu-qr.html'; };
cancelAdminBtn.onclick = () => adminDialog.close();
submitAdminBtn.onclick = tryUnlockAdmin;

// ---- Init ----
ITEMS = loadItems();
loadCart();
renderTabs();
renderGrid();
