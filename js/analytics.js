(function bootstrapAwkaAnalytics() {
    const config = window.AWKA_ANALYTICS || {};
    const measurementId = typeof config.measurementId === 'string' ? config.measurementId.trim() : '';
    const purchaseStorageKey = 'awka-ga4-tracked-purchases';
    const enabled = /^G-[A-Z0-9]+$/i.test(measurementId);

    function safeNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function readTrackedPurchases() {
        try {
            const raw = window.localStorage.getItem(purchaseStorageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function saveTrackedPurchase(transactionId) {
        try {
            const current = readTrackedPurchases();
            if (current.includes(transactionId)) return;
            const next = [...current, transactionId].slice(-40);
            window.localStorage.setItem(purchaseStorageKey, JSON.stringify(next));
        } catch (error) {
            // noop
        }
    }

    function hasTrackedPurchase(transactionId) {
        if (!transactionId) return false;
        return readTrackedPurchases().includes(transactionId);
    }

    function buildItem(item = {}, index = 0) {
        return {
            item_id: String(item.id || item.productId || item.cartId || item.key || item.name || `item-${index + 1}`),
            item_name: String(item.name || item.productName || item.label || 'Producto Awka'),
            item_brand: String(item.brand || 'Awka Liwen'),
            item_category: String(item.category || 'sin-definir'),
            item_variant: String(item.selectedSize || item.sizeLabel || item.variant || ''),
            price: safeNumber(item.price),
            quantity: Math.max(1, Number(item.quantity) || 1),
            index
        };
    }

    function normalizeItems(items) {
        return Array.isArray(items) ? items.map((item, index) => buildItem(item, index)) : [];
    }

    function sendEvent(name, params) {
        if (!enabled || typeof window.gtag !== 'function') {
            return;
        }

        window.gtag('event', name, params || {});
    }

    function trackWhatsAppClick(url) {
        sendEvent('generate_lead', {
            method: 'whatsapp',
            link_url: url || window.location.href,
            page_location: window.location.href
        });
    }

    window.awkaAnalytics = {
        enabled,
        measurementId,
        event(name, params) {
            sendEvent(name, params);
        },
        trackViewItem(item) {
            const gaItem = buildItem(item, 0);
            sendEvent('view_item', {
                currency: 'ARS',
                value: safeNumber(gaItem.price),
                items: [gaItem]
            });
        },
        trackAddToCart(payload = {}) {
            const items = normalizeItems(payload.items || []);
            if (!items.length) return;
            sendEvent('add_to_cart', {
                currency: payload.currency || 'ARS',
                value: safeNumber(payload.value),
                items
            });
        },
        trackBeginCheckout(payload = {}) {
            const items = normalizeItems(payload.items || []);
            if (!items.length) return;
            sendEvent('begin_checkout', {
                currency: payload.currency || 'ARS',
                value: safeNumber(payload.value),
                items
            });
        },
        trackPurchaseOnce(transactionId, payload = {}) {
            if (!transactionId || hasTrackedPurchase(transactionId)) {
                return false;
            }

            const items = normalizeItems(payload.items || []);
            sendEvent('purchase', {
                transaction_id: transactionId,
                currency: payload.currency || 'ARS',
                value: safeNumber(payload.value),
                items
            });
            saveTrackedPurchase(transactionId);
            return true;
        },
        trackLogin(method = 'club_awka') {
            sendEvent('login', { method });
        },
        trackRedeem(payload = {}) {
            sendEvent('awka_redeem_reward', {
                reward_key: payload.key || '',
                item_name: payload.productName || payload.label || '',
                item_variant: payload.sizeLabel || '',
                item_category: payload.category || '',
                points_cost: safeNumber(payload.pointsCost)
            });
        },
        trackSpin(payload = {}) {
            sendEvent('awka_spin_result', {
                prize_name: payload.prize || '',
                prize_code: payload.code || '',
                prize_type: payload.type || '',
                winner: payload.winner ? 'true' : 'false'
            });
        },
        trackWhatsAppClick
    };

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link) return;

        const href = String(link.getAttribute('href') || '');
        if (href.includes('wa.me/') || href.includes('api.whatsapp.com/')) {
            trackWhatsAppClick(href);
        }
    });

    if (!enabled) {
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
        send_page_view: true,
        debug_mode: Boolean(config.debug)
    });
})();
