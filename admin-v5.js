console.log('POS PlayTime admin.js v5- loaded');
/* POS PlayTime – Admin page logic */

// ---- Storage keys ----
const LS_ITEMS_KEY      = 'posplaytime.items';
const LS_PASSCODE_KEY   = 'posplaytime.passcode';
const SESSION_ADMIN_KEY = 'posplaytime.adminAuthed';

// ---- Gate direct access: require session unlock ----
if (sessionStorage.getItem(SESSION_ADMIN_KEY) !== 'true') {
  window.location.href = 'index.html';
}

// ---- Default items (keep in sync with app.js DEFAULT_ITEMS) ----
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

// ---- Items storage helpers ----
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

// ---- State ----
let items = loadItems();
let editingId = null;

// ---- Elements ----
const backBtn           = document.getElementById('backBtn');
const lockBtn           = document.getElementById('lockBtn');
const setPassBtn        = document.getElementById('setPassBtn');
const setPassDialog     = document.getElementById('setPassDialog');
const newPassInput      = document.getElementById('newPassInput');
const cancelSetPassBtn  = document.getElementById('cancelSetPassBtn');
const saveSetPassBtn    = document.getElementById('saveSetPassBtn');

const emojiInput        = document.getElementById('emojiInput');
const nameInput         = document.getElementById('nameInput');
const categoryInput     = document.getElementById('categoryInput');
const priceInput        = document.getElementById('priceInput');
const addItemBtn        = document.getElementById('addItemBtn');
const saveItemBtn       = document.getElementById('saveItemBtn');
const cancelEditBtn     = document.getElementById('cancelEditBtn');
const itemsList         = document.getElementById('itemsList');

const exportItemsBtn    = document.getElementById('exportItemsBtn');
const importItemsBtn    = document.getElementById('importItemsBtn');
const importFile        = document.getElementById('importFile');
const resetItemsBtn     = document.getElementById('resetItemsBtn');

// ---- Header buttons ----
backBtn.onclick = () => { window.location.href = 'index.html'; };
lockBtn.onclick = () => {
  sessionStorage.removeItem(SESSION_ADMIN_KEY);
  window.location.href = 'index.html';
};
setPassBtn.onclick = () => {
  newPassInput.value = '';
  setPassDialog.showModal();
  newPassInput.focus();
};
cancelSetPassBtn.onclick = () => setPassDialog.close();
saveSetPassBtn.onclick = () => {
  const val = (newPassInput.value || '').trim();
  if (!val || val.length < 4) {
    alert('Please enter at least 4 digits.');
    return;
  }
  localStorage.setItem(LS_PASSCODE_KEY, val);
  setPassDialog.close();
  alert('Passcode updated.');
};

// ---- Items list rendering ----

function renderItems() {
  itemsList.innerHTML = '';
  if (!items.length) {
    itemsList.textContent = 'No items yet. Add some above.';
    return;
  }

  items.forEach(i => {
    const wrap = document.createElement('div');
    wrap.className = 'order';
    wrap.innerHTML = `
      <h4>${i.emoji} ${i.name} — $${i.price.toFixed(2)}</h4>
      <p><strong>Category:</strong> ${i.category}</p>

      <div class="cart-actions" style="justify-content: space-between; align-items: center;">
        <div>
          <button class="primary" data-edit="${i.id}">Edit</button>
        </div>

        <div class="item-actions">
          <button class="menu-btn" aria-haspopup="true" aria-expanded="false">Actions ▾</button>
          <div class="menu" role="menu">
            <button role="menuitem" data-edit="${i.id}">Edit</button>
            <button role="menuitem" data-delete="${i.id}" style="color:#b91c1c;">Delete</button>
          </div>
        </div>
      </div>
    `;
    itemsList.appendChild(wrap);
  });

  // Wire edit/delete from both places
  itemsList.querySelectorAll('[data-edit]').forEach(btn => {
    btn.onclick = () => startEdit(btn.getAttribute('data-edit'));
  });
  itemsList.querySelectorAll('[data-delete]').forEach(btn => {
    btn.onclick = () => deleteItem(btn.getAttribute('data-delete'));
  });

  // Dropdown open/close behavior
  itemsList.querySelectorAll('.item-actions .menu-btn').forEach(btn => {
    btn.onclick = (e) => {
      const container = e.currentTarget.closest('.item-actions');
      const menu = container.querySelector('.menu');
      const isOpen = menu.classList.contains('open');
      // Close any other open menus
      itemsList.querySelectorAll('.item-actions .menu.open').forEach(m => {
        if (m !== menu) m.classList.remove('open');
      });
      menu.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    };
  });
  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!itemsList.contains(e.target)) {
      itemsList.querySelectorAll('.item-actions .menu.open').forEach(m => m.classList.remove('open'));
      itemsList.querySelectorAll('.item-actions .menu-btn[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
  }, { once: true });
}


// ---- Form helpers ----
function clearForm() {
  emojiInput.value = '';
  nameInput.value = '';
  categoryInput.value = '';
  priceInput.value = '';
}

function startEdit(id) {
  const i = items.find(x => x.id === id);
  if (!i) return;
  editingId = id;
  emojiInput.value = i.emoji;
  nameInput.value = i.name;
  categoryInput.value = i.category;
  priceInput.value = i.price;
  saveItemBtn.disabled = false;
  cancelEditBtn.disabled = false;
  addItemBtn.disabled = true;
}

function cancelEdit() {
  editingId = null;
  clearForm();
  saveItemBtn.disabled = true;
  cancelEditBtn.disabled = true;
  addItemBtn.disabled = false;
}

// ---- CRUD operations ----
function addItem() {
  const emoji    = emojiInput.value.trim() || '🍽️';
  const name     = nameInput.value.trim();
  const category = categoryInput.value.trim() || 'Mains';
  const price    = parseFloat(priceInput.value);

  if (!name || Number.isNaN(price)) {
    alert('Please enter a name and a valid price.');
    return;
  }

  const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  items.push({ id, emoji, name, price, category });
  saveItems(items);
  clearForm();
  renderItems();
}

function saveEdit() {
  if (!editingId) return;
  const i = items.find(x => x.id === editingId);
  if (!i) return;

  const emoji    = emojiInput.value.trim() || i.emoji;
  const name     = nameInput.value.trim() || i.name;
  const category = categoryInput.value.trim() || i.category;
  const price    = parseFloat(priceInput.value);

  if (Number.isNaN(price)) {
    alert('Please enter a valid price.');
    return;
  }

  Object.assign(i, { emoji, name, price, category });
  saveItems(items);
  cancelEdit();
  renderItems();
}

function deleteItem(id) {
  if (!confirm('Delete this item?')) return;
  items = items.filter(i => i.id !== id);
  saveItems(items);
  renderItems();
}

// ---- Import/Export/Reset ----
function exportItems() {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pos-playtime-items.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importItemsFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error('Invalid format: expected an array of items');
      items = parsed;
      saveItems(items);
      renderItems();
      alert('Items imported.');
    } catch (e) {
      alert('Failed to import: ' + e.message);
    }
  };
  reader.readAsText(file);
}

function resetItems() {
  if (!confirm('Reset items to defaults? This will overwrite your local items.')) return;
  items = DEFAULT_ITEMS.slice();
  saveItems(items);
  renderItems();
}

// ---- Wire up ----
addItemBtn.onclick       = addItem;
saveItemBtn.onclick      = saveEdit;
cancelEditBtn.onclick    = cancelEdit;
exportItemsBtn.onclick   = exportItems;
importItemsBtn.onclick   = () => importFile.click();
importFile.onchange      = (e) => {
  const file = e.target.files[0];
  if (file) importItemsFromFile(file);
};
resetItemsBtn.onclick    = resetItems;

// ---- Init ----
renderItems();
