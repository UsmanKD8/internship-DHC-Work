// ===== CART STATE =====
let cartItems = JSON.parse(localStorage.getItem('kdstore_cart') || '[]');

function saveCart() {
    localStorage.setItem('kdstore_cart', JSON.stringify(cartItems));
}

function updateCartDisplay() {
    const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// ===== TOAST NOTIFICATION =====
function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.style.display = 'none';
    }, 2500);
}

// ===== ADD TO CART (Details Page) =====
const cartBtn = document.getElementById('cartBtn');
if (cartBtn) {
    cartBtn.addEventListener('click', function () {
        const colorEl = document.getElementById('colorSelect');
        const qtyEl = document.getElementById('qtyInput');
        const selectedColor = colorEl ? colorEl.value : 'Default';
        const qty = qtyEl ? parseInt(qtyEl.value) || 1 : 1;

        const existing = cartItems.find(i => i.name === 'Wireless Headphone' && i.color === selectedColor);
        if (existing) {
            existing.qty += qty;
        } else {
            cartItems.push({ name: 'Wireless Headphone', color: selectedColor, price: 99, qty });
        }
        saveCart();
        updateCartDisplay();
        showToast('✅ Wireless Headphone (' + selectedColor + ') x' + qty + ' added to cart!');
    });
}

// ===== ADD TO CART (Products Grid) =====
document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const name = this.dataset.name;
        const price = parseFloat(this.dataset.price);
        const existing = cartItems.find(i => i.name === name);
        if (existing) {
            existing.qty += 1;
        } else {
            cartItems.push({ name, price, qty: 1, color: 'Default' });
        }
        saveCart();
        updateCartDisplay();
        showToast('✅ ' + name + ' added to cart!');
    });
});

// ===== SEARCH =====
function doSearch() {
    const input = document.querySelector('.search-box input');
    const val = input ? input.value.trim() : '';
    if (!val) {
        showToast('⚠️ Please enter something to search!');
        return;
    }
    const products = [
        { name: 'Wireless Headphone', page: 'details.html' },
        { name: 'Smart Watch', page: 'products.html' },
        { name: 'DSLR Camera', page: 'products.html' },
        { name: 'Smart Phone', page: 'products.html' },
    ];
    const found = products.find(p => p.name.toLowerCase().includes(val.toLowerCase()));
    if (found) {
        showToast('🔍 Found: ' + found.name + '! Redirecting...');
        setTimeout(() => { window.location.href = found.page; }, 1200);
    } else {
        showToast('❌ No product found for "' + val + '"');
    }
}

const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', doSearch);
}

// Search on Enter key
const searchInput = document.querySelector('.search-box input');
if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doSearch();
    });
}

// ===== QUANTITY BUTTONS =====
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const qtyInput = document.getElementById('qtyInput');

if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener('click', function () {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
    });
}

if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener('click', function () {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
    });
}

// ===== WISHLIST =====
document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const name = this.dataset.name;
        this.textContent = '❤️';
        showToast('❤️ ' + name + ' added to Wishlist!');
    });
});

// ===== INIT =====
updateCartDisplay();