/* ═══════════════════════════════════════════════════════════════════════════
   CHECKOUT.JS — Multi-step checkout flow
   ═══════════════════════════════════════════════════════════════════════════ */

let currentStep = 1;
let orderData = {};

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if cart empty
    if (cart.length === 0) {
        window.location.href = 'shop.html';
        return;
    }

    renderOrderSummary();
    setupDeliveryForm();
    setupPaymentMethods();
    setupPaymentStep();
});

// ── Render Order Summary (right sidebar) ────────────────────────────────
function renderOrderSummary() {
    const container = document.getElementById('summaryItems');
    if (!container) return;

    container.innerHTML = '';
    cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'summary-item';
        el.innerHTML = `
            <div class="summary-item-color" style="background:${item.color}"></div>
            <div class="summary-item-info">
                <strong>${item.name}</strong>
                <span>${item.size} (${item.weight}) × ${item.qty}</span>
            </div>
            <span class="summary-item-price">₹${item.price * item.qty}</span>
        `;
        container.appendChild(el);
    });

    const subtotal = getCartTotal();
    const delivery = subtotal >= 200 ? 0 : 30;
    const total = subtotal + delivery;

    document.getElementById('summarySubtotal').textContent = `₹${subtotal}`;
    
    const deliveryEl = document.getElementById('summaryDelivery');
    if (delivery === 0) {
        deliveryEl.textContent = 'FREE';
        deliveryEl.className = 'delivery-free';
    } else {
        deliveryEl.textContent = `₹${delivery}`;
        deliveryEl.className = '';
    }
    
    document.getElementById('summaryTotal').textContent = `₹${total}`;
}

// ── Step Navigation ─────────────────────────────────────────────────────
function goToStep(step) {
    currentStep = step;

    // Update step indicators
    document.querySelectorAll('.checkout-steps .step').forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.toggle('active', s <= step);
        el.classList.toggle('completed', s < step);
    });

    // Update step line colors
    const lines = document.querySelectorAll('.step-line');
    lines.forEach((line, i) => {
        line.classList.toggle('active', i + 1 < step);
    });

    // Show/hide panels
    document.querySelectorAll('.checkout-step-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const panel = document.getElementById(`step${step}Panel`);
    if (panel) panel.classList.add('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Step 1: Delivery Form ───────────────────────────────────────────────
function setupDeliveryForm() {
    const form = document.getElementById('deliveryForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        orderData.firstName = document.getElementById('firstName').value;
        orderData.lastName = document.getElementById('lastName').value;
        orderData.email = document.getElementById('email').value;
        orderData.phone = document.getElementById('phone').value;
        orderData.address = document.getElementById('address').value;
        orderData.city = document.getElementById('city').value;
        orderData.pincode = document.getElementById('pincode').value;

        goToStep(2);
    });
}

// ── Step 2: Payment Methods ─────────────────────────────────────────────
function setupPaymentMethods() {
    const options = document.querySelectorAll('.payment-option');
    const cardForm = document.getElementById('cardForm');

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            const val = opt.querySelector('input').value;
            if (cardForm) {
                cardForm.style.display = val === 'card' ? 'block' : 'none';
            }
        });
    });
}

function setupPaymentStep() {
    const backBtn = document.getElementById('backToDelivery');
    if (backBtn) {
        backBtn.addEventListener('click', () => goToStep(1));
    }

    const placeBtn = document.getElementById('placeOrderBtn');
    if (placeBtn) {
        placeBtn.addEventListener('click', () => {
            placeOrder();
        });
    }
}

// ── Place Order ─────────────────────────────────────────────────────────
function placeOrder() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    orderData.paymentMethod = selectedPayment ? selectedPayment.value : 'cod';

    // Generate order ID
    const orderId = 'LAY-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    orderData.orderId = orderId;
    orderData.items = [...cart];
    orderData.total = getCartTotal();
    orderData.delivery = orderData.total >= 200 ? 0 : 30;
    orderData.grandTotal = orderData.total + orderData.delivery;
    orderData.date = new Date().toISOString();
    orderData.status = 'confirmed';

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('lays_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('lays_orders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    saveCart();

    // Show confirmation
    document.getElementById('orderId').textContent = orderId;

    const details = document.getElementById('orderConfirmDetails');
    if (details) {
        const paymentLabels = { card: 'Credit/Debit Card', upi: 'UPI', cod: 'Cash on Delivery' };
        details.innerHTML = `
            <div class="confirm-row">
                <span>Delivering to</span>
                <strong>${orderData.firstName} ${orderData.lastName}</strong>
            </div>
            <div class="confirm-row">
                <span>Address</span>
                <strong>${orderData.address}, ${orderData.city} - ${orderData.pincode}</strong>
            </div>
            <div class="confirm-row">
                <span>Payment</span>
                <strong>${paymentLabels[orderData.paymentMethod]}</strong>
            </div>
            <div class="confirm-row">
                <span>Total Paid</span>
                <strong class="text-gradient">₹${orderData.grandTotal}</strong>
            </div>
        `;
    }

    // Update track order link
    const trackLink = document.getElementById('trackOrderLink');
    if (trackLink) {
        trackLink.href = `order.html?id=${orderId}`;
    }

    goToStep(3);
}
