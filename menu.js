
console.log('POS PlayTime menu.js v1 - loaded');

/** Keys consistent with app.js **/
const LS_ITEMS_KEY = 'posplaytime.items';

/** Fallback DEFAULT_ITEMS — copy from app.js to keep parity **/
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

/** Helpers **/
const currency = n => `$${(+n).toFixed(2)}`;
function loadItems() {
  try {
    const fromLS = JSON.parse(localStorage.getItem(LS_ITEMS_KEY));
    return Array.isArray(fromLS) && fromLS.length ? fromLS : DEFAULT_ITEMS.slice();
  } catch {
    return DEFAULT_ITEMS.slice();
  }
}

/**
 * Optional flavor text
 * You can add per-category and per-item flavor lines.
 * Keys must match category names and item ids.
 */
const CATEGORY_FLAVORS = {
  Appetizers: 'Perfect starters to kick off your meal.',
  Mains: 'Favourites that you came here for.',
  Drinks: 'Quench your thirst—hot or cold.',
  Desserts: 'Sweet finishes you won’t forget.',
  Candy: 'Treat yourself—share if you must!'
};

const ITEM_FLAVORS = {
  // Example extra descriptions:
fries: 'Crispy golden goodness, perfect for dipping',
sticks: 'Cheesy, melty magic in every bite',
wings: 'Saucy, spicy, finger-lickin’ fun',
buns: 'Soft, warm clouds for your favorite fillings',
hashbrowns: 'Crispy on the outside, cozy on the inside',
burger: 'Stacked high with flavor and good vibes',
hotdog: 'Classic comfort in a bun, no frills needed',
pizza: 'A slice of happiness, straight from the oven',
noodles: 'Twirls of tasty goodness, slurp away',
friedegg: 'Sunny side of life on your plate',
bacon: 'Crispy strips of pure joy',
ham: 'Savory slices that never disappoint',
pop: 'Fizzy fun in every sip',
water: 'Refreshment in its purest form',
juice: 'Fruit-powered goodness to brighten your day',
milk: 'Smooth, creamy, and always comforting',
coffee: 'Good stuff comes in cups',
icecream: 'Cold, sweet dreams in a scoop',
cupcake: 'Tiny cakes, big smiles',
cookie: 'Bite-sized happiness with a crunch',
gummyb: 'Chewy little bears bringing sweet cheer',
fuzzyp: 'A peachy sip of bubbly bliss',
chocolate: 'Rich, velvety indulgence for your soul'
};

// Optional: category icons for headers
const CATEGORY_ICONS = {
  Appetizers: '🥨',
  Mains: '🍽️',
  Drinks: '🥤',
  Desserts: '🍰',
  Candy: '🍬',
  // Add more categories as needed:
  // Coffee: '☕',
  // Breakfast: '🍳',
};


/** Render **/
function renderMenu() {
  const container = document.getElementById('menuContainer');
  if (!container) {
    console.error('menuContainer element not found in DOM.');
    return;
  }
  container.innerHTML = ''; // clear before rendering
  const items = loadItems();

  // Group items by category
  const categories = [...new Set(items.map(i => i.category))];
  categories.forEach(cat => {
    const section = document.createElement('section');
    section.className = 'category';

    const h2 = document.createElement('h2');
    const icon = CATEGORY_ICONS[cat];
    h2.textContent = icon ? `${icon} ${cat}` : cat;
    section.appendChild(h2);

    // Category flavor (optional)
    const catFlavor = CATEGORY_FLAVORS[cat];
    if (catFlavor) {
      const p = document.createElement('p');
      p.className = 'flavor';
      p.textContent = catFlavor;
      section.appendChild(p);
    }

    const list = document.createElement('div');
    list.className = 'items';

    items
      .filter(i => i.category === cat)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(i => {
        const row = document.createElement('div');
        row.className = 'item';

        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = i.emoji;

        const nameWrap = document.createElement('div');
        const nameEl = document.createElement('div');
        nameEl.className = 'name';
        nameEl.textContent = i.name;

        const descEl = document.createElement('div');
        descEl.className = 'desc';
        const desc = ITEM_FLAVORS[i.id];
        if (desc) descEl.textContent = desc;

        nameWrap.appendChild(nameEl);
        if (desc) nameWrap.appendChild(descEl);

        const priceEl = document.createElement('div');
        priceEl.className = 'price';
        priceEl.textContent = currency(i.price);

        row.appendChild(emoji);
        row.appendChild(nameWrap);
        row.appendChild(priceEl);

        list.appendChild(row);
      });

    section.appendChild(list);
    container.appendChild(section);
  });
}


document.addEventListener('DOMContentLoaded', renderMenu);
