// Shop functionality - Cart and filters
let cart = [];

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
        const imageContent = product.image ? 
            `<img src="${product.image}" alt="${product.name}">` : 
            product.icon;

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
        modalImage.innerHTML = `<img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:contain;">`;
    } else {
        modalIcon.style.display = 'block';
        modalImage.style.display = 'none';
        modalIcon.textContent = product.icon;
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
            const imageContent = item.image ? 
                `<img src="${item.image}" alt="${item.name}">` : 
                item.icon;
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

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`¡Gracias por tu compra!\n\nTotal: $${total.toLocaleString()}\n\nSerás redirigido al pago...`);
    
    cart = [];
    updateCart();
    toggleCart();
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Filter Functionality
    const filters = document.getElementById('filters');
    if (filters) {
        filters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                const searchInput = document.getElementById('searchInput');
                const searchTerm = searchInput ? searchInput.value : '';
                renderProducts(e.target.dataset.category, searchTerm);
            }
        });
    }

    // Setup search
    setupSearch();

    // Initial render
    renderProducts();
});
