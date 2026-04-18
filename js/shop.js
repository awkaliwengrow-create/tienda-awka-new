// Shop functionality - Cart and filters
const CART_STORAGE_KEY = 'awka-cart';
const CHECKOUT_PROFILE_STORAGE_KEY = 'awka-checkout-profile';
const PENDING_PURCHASE_STORAGE_KEY = 'awka-pending-purchase';
const WHATSAPP_ORDER_NUMBER = '542494009164';
const CLUB_POINTS_PER_AMOUNT = 5000;
let cart = [];
const validCategories = new Set(['todos', 'fertilizantes', 'plaguicidas', 'herramientas', 'macetas', 'parafernalia', 'papeles', 'filtros']);

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderImageFallback(product, compact = false) {
    const brand = escapeHtml(product.brand || 'Awka Liwen');
    const name = escapeHtml(product.name || 'Producto');
    const initials = escapeHtml((product.brand || product.name || 'AW')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase());
    const compactClass = compact ? ' image-fallback--compact' : '';

    return `
        <div class="image-fallback${compactClass}" role="img" aria-label="${name}">
            <span class="image-fallback-badge">${initials}</span>
            <span class="image-fallback-brand">${brand}</span>
            <span class="image-fallback-name">${name}</span>
        </div>
    `;
}

function renderProductImage(product, compact = false) {
    if (!product.image) {
        return product.icon || renderImageFallback(product, compact);
    }

    const name = escapeHtml(product.name || 'Producto');
    const brand = escapeHtml(product.brand || 'Awka Liwen');
    const compactAttr = compact ? 'true' : 'false';

    return `<img src="${product.image}" alt="${name}" loading="lazy" onerror="handleImageError(this)" data-product-name="${name}" data-product-brand="${brand}" data-compact="${compactAttr}">`;
}

function handleImageError(image) {
    const fallbackMarkup = renderImageFallback({
        name: image.dataset.productName || image.alt || 'Producto',
        brand: image.dataset.productBrand || 'Awka Liwen'
    }, image.dataset.compact === 'true');
    image.outerHTML = fallbackMarkup;
}

// Get category display name
function getCategoryName(category) {
    const names = {
        'fertilizantes': 'Fertilizantes/Nutrientes',
        'plaguicidas': 'Plaguicidas/Insecticidas',
        'herramientas': 'Herramientas',
        'macetas': 'Macetas',
        'parafernalia': 'Parafernalia',
        'papeles': 'Papeles',
        'filtros': 'Filtros',
        'sin-definir': 'Sin Definir'
    };
    return names[category] || category;
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        cart = [];
    }
}

function normalizePhone(phone = '') {
    return String(phone).replace(/\D/g, '').slice(-10);
}

function saveCheckoutProfile(profile) {
    localStorage.setItem(CHECKOUT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function loadCheckoutProfile() {
    try {
        const savedProfile = localStorage.getItem(CHECKOUT_PROFILE_STORAGE_KEY);
        return savedProfile ? JSON.parse(savedProfile) : { name: '', phone: '' };
    } catch (error) {
        return { name: '', phone: '' };
    }
}

function savePendingPurchase(purchase) {
    localStorage.setItem(PENDING_PURCHASE_STORAGE_KEY, JSON.stringify(purchase));
}

function loadPendingPurchase() {
    try {
        const savedPurchase = localStorage.getItem(PENDING_PURCHASE_STORAGE_KEY);
        return savedPurchase ? JSON.parse(savedPurchase) : null;
    } catch (error) {
        return null;
    }
}

function clearPendingPurchase() {
    localStorage.removeItem(PENDING_PURCHASE_STORAGE_KEY);
}

function buildOrderReference(phone) {
    return `awka-${Date.now()}-${normalizePhone(phone)}`;
}

function formatCartMessage() {
    const lines = [
        'Hola Awka Liwen, quiero finalizar esta compra:',
        ''
    ];

    cart.forEach(item => {
        const sizeInfo = item.selectedSize ? ` - ${item.selectedSize}` : '';
        const subtotal = item.price * item.quantity;
        lines.push(`- ${item.name}${sizeInfo} x${item.quantity} | $${subtotal.toLocaleString()}`);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    lines.push('');
    lines.push(`Total: $${total.toLocaleString()}`);
    lines.push('Quiero coordinar pago y entrega.');

    return lines.join('\n');
}

// Render Products
function renderProducts(category = 'todos', searchTerm = '') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let filteredProducts = category === 'todos' ? products : products.filter(p => p.category === category);
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    grid.innerHTML = filteredProducts.map(product => {
        let priceDisplay = '';
        if (product.sizes && product.sizes.length > 0) {
            if (product.sizes.length === 1) {
                priceDisplay = `<div class="product-price">$${product.sizes[0].price.toLocaleString()}</div>
                               <div class="product-size">${product.sizes[0].size}</div>`;
            } else {
                priceDisplay = `<div class="product-price">Desde $${Math.min(...product.sizes.map(s => s.price)).toLocaleString()}</div>
                               <div class="product-size">${product.sizes.length} tamaños</div>`;
            }
        }

        const offerBadge = product.offer ? `<div class="offer-badge">${product.offerText || 'OFERTA'}</div>` : '';
        const imageContent = renderProductImage(product);

        return `
        <div class="product-card" onclick="showProductDetails(${product.id})">
            ${offerBadge}
            <div class="product-image">${imageContent}</div>
            <div class="product-info">
                <div class="product-category">${product.brand} · ${getCategoryName(product.category)}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div>${priceDisplay}</div>
                    <button class="add-to-cart" onclick="event.stopPropagation(); ${product.sizes && product.sizes.length > 1 ? `showProductDetails(${product.id})` : `addToCart(${product.id}, 0)`}">
                        ${product.sizes && product.sizes.length > 1 ? 'Ver opciones' : 'Agregar'}
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

// Show Product Details Modal
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.sizes || product.sizes.length === 0) return;

    const modal = document.getElementById('sizeModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalImage = document.getElementById('modalImage');
    const modalName = document.getElementById('modalName');
    const modalBrand = document.getElementById('modalBrand');
    const sizeOptions = document.getElementById('sizeOptions');

    if (product.image) {
        modalIcon.style.display = 'none';
        modalImage.style.display = 'block';
        modalImage.innerHTML = renderProductImage(product);
    } else if (product.icon) {
        modalIcon.style.display = 'block';
        modalImage.style.display = 'none';
        modalIcon.textContent = product.icon;
    } else {
        modalIcon.style.display = 'none';
        modalImage.style.display = 'block';
        modalImage.innerHTML = renderImageFallback(product);
    }

    modalName.textContent = product.name;
    modalBrand.textContent = product.brand;

    sizeOptions.innerHTML = product.sizes.map((size, index) => `
        <div class="size-option" onclick="addToCart(${productId}, ${index})">
            <span class="size-label">${size.size}</span>
            <span class="size-price">$${size.price.toLocaleString()}</span>
        </div>
    `).join('');

    modal.classList.add('active');
}

// Close Modal
function closeModal(event) {
    if (!event || event.target.id === 'sizeModal') {
        document.getElementById('sizeModal').classList.remove('active');
    }
}

// Add to Cart
function addToCart(productId, sizeIndex = 0) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cartItem;
    if (product.sizes && product.sizes.length > 0) {
        const selectedSize = product.sizes[sizeIndex];
        const cartId = `${productId}-${sizeIndex}`;
        const existingItem = cart.find(item => item.cartId === cartId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItem = {
                ...product,
                cartId: cartId,
                selectedSize: selectedSize.size,
                price: selectedSize.price,
                quantity: 1
            };
            cart.push(cartItem);
        }
    } else {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
    }

    updateCart();
    closeModal();
}

// Update Cart Display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartFooter = document.getElementById('cartFooter');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    saveCart();

    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${totalPrice.toLocaleString()}`;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🌱</div>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => {
            const itemId = item.cartId || item.id;
            const sizeInfo = item.selectedSize ? ` - ${item.selectedSize}` : '';
            const imageContent = renderProductImage(item, true);
            return `
            <div class="cart-item">
                <div class="cart-item-image">${imageContent}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}${sizeInfo}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateQuantity('${itemId}', -1)">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity('${itemId}', 1)">+</button>
                        <button class="remove-item" onclick="removeItem('${itemId}')">Eliminar</button>
                    </div>
                </div>
            </div>
        `}).join('');
        cartFooter.style.display = 'block';
    }
}

// Update Quantity
function updateQuantity(itemId, change) {
    const item = cart.find(i => (i.cartId || i.id) === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItem(itemId);
        } else {
            updateCart();
        }
    }
}

// Remove Item
function removeItem(itemId) {
    cart = cart.filter(item => (item.cartId || item.id) !== itemId);
    updateCart();
}

// Toggle Cart
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert('Tu carrito esta vacio');
        return;
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(formatCartMessage())}`;
    window.open(whatsappUrl, '_blank', 'noopener');
}

// Checkout
async function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito esta vacio');
        return;
    }

    openCheckoutModal();
}

function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const profile = loadCheckoutProfile();
    const nameInput = document.getElementById('checkoutName');
    const phoneInput = document.getElementById('checkoutPhone');
    const feedback = document.getElementById('checkoutProfileFeedback');

    if (!modal || !nameInput || !phoneInput || !feedback) return;

    nameInput.value = profile.name || '';
    phoneInput.value = profile.phone || '';
    feedback.textContent = '';
    feedback.className = 'checkout-profile-feedback';
    modal.classList.add('active');
}

function closeCheckoutModal(event) {
    if (!event || event.target.id === 'checkoutModal') {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

async function submitCheckoutProfile(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert('Tu carrito esta vacio');
        closeCheckoutModal();
        return;
    }

    const nameInput = document.getElementById('checkoutName');
    const phoneInput = document.getElementById('checkoutPhone');
    const feedback = document.getElementById('checkoutProfileFeedback');
    const submitButton = event.submitter || event.target.querySelector('button[type="submit"]');

    const customer = {
        name: (nameInput?.value || '').trim(),
        phone: normalizePhone(phoneInput?.value || '')
    };

    if (!customer.name) {
        feedback.textContent = 'Ingresá tu nombre para acreditar puntos.';
        feedback.className = 'checkout-profile-feedback is-error';
        return;
    }

    if (customer.phone.length < 8) {
        feedback.textContent = 'Ingresá un WhatsApp válido para acreditar puntos.';
        feedback.className = 'checkout-profile-feedback is-error';
        return;
    }

    feedback.textContent = 'Preparando tu pago...';
    feedback.className = 'checkout-profile-feedback';

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const reference = buildOrderReference(customer.phone);

        saveCheckoutProfile(customer);
        savePendingPurchase({
            reference,
            phone: customer.phone,
            name: customer.name,
            totalAmount,
            createdAt: new Date().toISOString()
        });

        const response = await fetch('/api/create-preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer,
                reference,
                total_amount: totalAmount,
                items: cart.map((item) => ({
                    title: item.selectedSize ? `${item.name} - ${item.selectedSize}` : item.name,
                    quantity: item.quantity,
                    unit_price: item.price
                }))
            })
        });

        const data = await response.json();

        if (!response.ok || !data.init_point) {
            throw new Error('Mercado Pago no devolvio una URL de pago');
        }

        closeCheckoutModal();
        window.location.href = data.init_point;
    } catch (error) {
        if (submitButton) {
            submitButton.disabled = false;
        }
        feedback.textContent = 'No se pudo iniciar Mercado Pago. Te llevamos a WhatsApp como respaldo.';
        feedback.className = 'checkout-profile-feedback is-error';
        alert('No se pudo iniciar Mercado Pago. Te llevamos a WhatsApp como respaldo.');
        checkoutWhatsApp();
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            const activeFilter = document.querySelector('.filter-btn.active');
            const category = activeFilter ? activeFilter.dataset.category : 'todos';
            renderProducts(category, searchTerm);
        });
    }
}

function getCategoryFromHash() {
    const hashCategory = window.location.hash.replace('#', '').trim().toLowerCase();
    return validCategories.has(hashCategory) ? hashCategory : 'todos';
}

function syncCategoryUI(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

function scrollToProductsOnMobile() {
    if (window.innerWidth > 768) return;

    const productsSection = document.querySelector('.products');
    if (!productsSection) return;

    const header = document.querySelector('header');
    const headerOffset = header ? header.offsetHeight : 0;
    const top = productsSection.getBoundingClientRect().top + window.scrollY - headerOffset - 16;

    window.scrollTo({ top, behavior: 'smooth' });
}

function applyCategoryFromHash() {
    const category = getCategoryFromHash();
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value : '';
    syncCategoryUI(category);
    renderProducts(category, searchTerm);
}

function handlePaymentStatus() {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const reference = params.get('reference');

    if (!paymentStatus) return;

    if (paymentStatus === 'success') {
        processApprovedPurchase(reference);
        cart = [];
        updateCart();
    } else if (paymentStatus === 'pending') {
        alert('Tu pago quedo pendiente. Te avisaremos cuando se confirme.');
    } else if (paymentStatus === 'failure') {
        alert('El pago no se completo. Podes intentar de nuevo o pedir por WhatsApp.');
    }

    params.delete('payment');
    const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', cleanUrl);
}

async function processApprovedPurchase(referenceFromUrl) {
    const pendingPurchase = loadPendingPurchase();

    if (!pendingPurchase) {
        alert('Pago aprobado. Gracias por tu compra.');
        return;
    }

    if (referenceFromUrl && pendingPurchase.reference !== referenceFromUrl) {
        alert('Pago aprobado. Gracias por tu compra.');
        return;
    }

    try {
        const response = await fetch('/api/club-points-award', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reference: pendingPurchase.reference,
                phone: pendingPurchase.phone,
                name: pendingPurchase.name,
                totalAmount: pendingPurchase.totalAmount
            })
        });

        const data = await response.json();
        clearPendingPurchase();

        if (!response.ok) {
            throw new Error(data.message || 'Pago aprobado, pero no pudimos acreditar los puntos.');
        }

        const awardedPoints = Number(data.points) || 0;
        const suffix = awardedPoints > 0
            ? ` Sumaste ${awardedPoints} punto${awardedPoints === 1 ? '' : 's'} en Club Awka.`
            : ` Esta compra queda lista para Club Awka, pero no sumó puntos porque el monto no alcanzó $${CLUB_POINTS_PER_AMOUNT.toLocaleString('es-AR')}.`;

        alert(`Pago aprobado. Gracias por tu compra.${suffix}`);
    } catch (error) {
        alert(error.message || 'Pago aprobado. Gracias por tu compra.');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const searchToggle = document.getElementById('searchToggle');
    const shopToolbar = document.querySelector('.shop-toolbar');
    const searchInput = document.getElementById('searchInput');

    if (searchToggle && shopToolbar && window.innerWidth <= 768) {
        shopToolbar.classList.add('is-search-collapsed');

        searchToggle.addEventListener('click', () => {
            const isOpen = shopToolbar.classList.toggle('is-search-open');
            shopToolbar.classList.toggle('is-search-collapsed', !isOpen);

            if (isOpen && searchInput) {
                requestAnimationFrame(() => searchInput.focus());
            }
        });
    }

    // Filter Functionality
    const filters = document.getElementById('filters');
    if (filters) {
        filters.addEventListener('click', (e) => {
            const filterButton = e.target.closest('.filter-btn');
            if (filterButton) {
                const nextCategory = filterButton.dataset.category;
                syncCategoryUI(nextCategory);
                const searchInput = document.getElementById('searchInput');
                const searchTerm = searchInput ? searchInput.value : '';
                renderProducts(nextCategory, searchTerm);
                scrollToProductsOnMobile();

                if (nextCategory === 'todos') {
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                } else {
                    window.history.replaceState(null, '', `#${nextCategory}`);
                }
            }
        });
    }

    loadCart();
    updateCart();
    handlePaymentStatus();

    const checkoutProfileForm = document.getElementById('checkoutProfileForm');
    if (checkoutProfileForm) {
        checkoutProfileForm.addEventListener('submit', submitCheckoutProfile);
    }

    // Setup search
    setupSearch();

    // Initial render
    applyCategoryFromHash();
});

window.addEventListener('hashchange', applyCategoryFromHash);

