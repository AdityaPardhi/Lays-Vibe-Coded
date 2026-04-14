/* ═══════════════════════════════════════════════════════════════════════════
   CART.JS — Shared cart logic (localStorage-backed) used across all pages
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Product Data ──────────────────────────────────────────────────────────
const PRODUCTS = [
    {
        id: 'classic-salted',
        name: 'Classic Salted',
        tagline: 'The original, perfectly salted potato chip.',
        desc: 'The one that started it all. Our Classic Salted chips are made from the finest, hand-picked potatoes, sliced thin, and seasoned with just the right amount of salt. Simple, timeless, and endlessly satisfying.',
        colorHex: '#F1B11B',
        colorName: 'yellow',
        badge: 'ORIGINAL',
        imgFile: 'img/classic_salted.png',
        sizes: [
            { label: 'Small', weight: '52g', price: 20 },
            { label: 'Medium', weight: '115g', price: 50 },
            { label: 'Large', weight: '235g', price: 100 },
            { label: 'Party Pack', weight: '500g', price: 200 }
        ]
    },
    {
        id: 'magic-masala',
        name: 'Magic Masala',
        tagline: 'India\'s favorite spicy and tangy chatpata flavor.',
        desc: 'A burst of bold Indian spices in every bite. Magic Masala is a celebration of tangy, spicy, and utterly addictive flavor that keeps you reaching for one more chip.',
        colorHex: '#005BBB',
        colorName: 'blue',
        badge: 'BESTSELLER',
        imgFile: 'img/magic_masala.png',
        sizes: [
            { label: 'Small', weight: '52g', price: 20 },
            { label: 'Medium', weight: '115g', price: 50 },
            { label: 'Large', weight: '235g', price: 100 },
            { label: 'Party Pack', weight: '500g', price: 200 }
        ]
    },
    {
        id: 'cream-onion',
        name: 'Cream & Onion',
        tagline: 'Smooth, creamy, savory onion perfection.',
        desc: 'American-style sophistication meets chip perfection. The rich, creamy onion seasoning coats every ripple for a buttery smooth flavor experience.',
        colorHex: '#00A651',
        colorName: 'green',
        badge: 'FAN FAVORITE',
        imgFile: 'img/cream_onion.png',
        sizes: [
            { label: 'Small', weight: '52g', price: 20 },
            { label: 'Medium', weight: '115g', price: 50 },
            { label: 'Large', weight: '235g', price: 100 },
            { label: 'Party Pack', weight: '500g', price: 200 }
        ]
    },
    {
        id: 'tomato-tango',
        name: 'Spanish Tomato Tango',
        tagline: 'Sweet, tangy, and dangerously irresistible.',
        desc: 'A fiery Spanish twist — sun-ripened tomato flavor with just the right amount of tang. The Tomato Tango is bold, bright, and perfect for those who like to live on the flavorful edge.',
        colorHex: '#EF1C24',
        colorName: 'red',
        badge: 'TRENDING',
        imgFile: 'img/tomato_tango.png',
        sizes: [
            { label: 'Small', weight: '52g', price: 20 },
            { label: 'Medium', weight: '115g', price: 50 },
            { label: 'Large', weight: '235g', price: 100 },
            { label: 'Party Pack', weight: '500g', price: 200 }
        ]
    }
];

// Returns real image path if available, otherwise generates a vivid SVG placeholder
function getProductSVG(product) {
    // Return real image if available (copy generated PNGs to img/ folder)
    if (product.imgFile) return product.imgFile;

    // SVG fallback
    const color = product.colorHex;
    return `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
            <defs>
                <radialGradient id="bg" cx="50%" cy="40%">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#111" stop-opacity="1"/>
                </radialGradient>
                <linearGradient id="chip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${color}"/>
                    <stop offset="100%" stop-color="${color}" stop-opacity="0.6"/>
                </linearGradient>
            </defs>
            <rect width="300" height="400" fill="url(#bg)" rx="20"/>
            <ellipse cx="150" cy="160" rx="80" ry="90" fill="url(#chip)" opacity="0.9"/>
            <text x="150" y="300" text-anchor="middle" fill="white" font-family="sans-serif" font-size="18" font-weight="bold">${product.name}</text>
            <text x="150" y="330" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14" opacity="0.6">LAY'S PREMIUM</text>
        </svg>
    `)}`;
}

// ── Cart State ──────────────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('lays_cart') || '[]');

function saveCart() {
    localStorage.setItem('lays_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(productId, sizeLabel, qty = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const size = product.sizes.find(s => s.label === sizeLabel);
    if (!size) return;

    const key = `${productId}_${sizeLabel}`;
    const existing = cart.find(item => item.key === key);

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            key,
            productId,
            name: product.name,
            size: sizeLabel,
            weight: size.weight,
            price: size.price,
            qty,
            color: product.colorHex
        });
    }
    saveCart();
    showToast(`${product.name} (${sizeLabel}) added to bag!`);
}

function removeFromCart(key) {
    cart = cart.filter(item => item.key !== key);
    saveCart();
}

function updateQtyInCart(key, delta) {
    const item = cart.find(i => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(key);
        return;
    }
    saveCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ── Cart UI ──────────────────────────────────────────────────────────────
function updateCartUI() {
    // Update count badges
    const countEls = document.querySelectorAll('#cartCount');
    const countHeaderEls = document.querySelectorAll('#cartCountHeader');
    const count = getCartCount();

    countEls.forEach(el => el.textContent = count);
    countHeaderEls.forEach(el => el.textContent = `(${count})`);

    // Render cart items
    const cartItemsEl = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('emptyCartMsg');
    const cartFooter = document.getElementById('cartFooter');

    if (!cartItemsEl) return;

    // Clear existing items (except empty msg)
    const existingItems = cartItemsEl.querySelectorAll('.cart-item');
    existingItems.forEach(el => el.remove());

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'flex';
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        if (emptyMsg) emptyMsg.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';

        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-color" style="background:${item.color}"></div>
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>${item.size} (${item.weight})</span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn-sm" onclick="updateQtyInCart('${item.key}', -1)">−</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn-sm" onclick="updateQtyInCart('${item.key}', 1)">+</button>
                </div>
                <div class="cart-item-price">₹${item.price * item.qty}</div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.key}')">&times;</button>
            `;
            cartItemsEl.insertBefore(el, emptyMsg);
        });
    }

    // Update total
    const totalEl = document.getElementById('cartTotalVal');
    if (totalEl) totalEl.textContent = `₹${getCartTotal()}`;
}

// ── Cart Sidebar Toggle ─────────────────────────────────────────────────
function setupCart() {
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartBtn && cartOverlay) {
        cartBtn.addEventListener('click', () => {
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeCart && cartOverlay) {
        closeCart.addEventListener('click', () => {
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                cartOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your bag is empty!');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    updateCartUI();
}

// ── Toast ────────────────────────────────────────────────────────────────
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Navbar Scroll Effect ─────────────────────────────────────────────────
function setupNavbar() {
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (!nav) return;
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile menu
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            menuBtn.classList.toggle('open');
        });
    }
}

// ── Init (shared) ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupCart();
    setupNavbar();
});
