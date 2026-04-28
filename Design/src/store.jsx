/* Global store + cart + wishlist + router */

const StoreCtx = React.createContext(null);

function StoreProvider({ children }) {
  const [route, setRoute] = React.useState(() => {
    const h = window.location.hash.replace('#', '');
    return h || 'home';
  });
  const [cart, setCart] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('sk-cart') || '[]'); } catch { return []; }
  });
  const [wish, setWish] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('sk-wish') || '[]'); } catch { return []; }
  });
  const [toasts, setToasts] = React.useState([]);
  const [drawer, setDrawer] = React.useState(false);
  const [tweaks, setTweaksRaw] = React.useState(() => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('sk-tweaks') || '{}') }; } catch { return { ...DEFAULTS }; }
  });
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  React.useEffect(() => { localStorage.setItem('sk-cart', JSON.stringify(cart)); }, [cart]);
  React.useEffect(() => { localStorage.setItem('sk-wish', JSON.stringify(wish)); }, [wish]);
  React.useEffect(() => { localStorage.setItem('sk-tweaks', JSON.stringify(tweaks)); }, [tweaks]);

  React.useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.replace('#', '') || 'home');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = React.useCallback((r) => {
    window.location.hash = r;
  }, []);

  const pushToast = React.useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, msg }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 2400);
  }, []);

  const cartApi = React.useMemo(() => ({
    items: cart,
    add: (product, qty = 1, variant = null) => {
      setCart(prev => {
        const key = product.id + (variant || '');
        const found = prev.find(i => i.key === key);
        if (found) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
        return [...prev, { key, id: product.id, qty, variant }];
      });
      setDrawer(true);
      pushToast(`Added ${product.name.split(' ').slice(0, 4).join(' ')}…`);
    },
    updateQty: (key, qty) => {
      setCart(prev => qty <= 0 ? prev.filter(i => i.key !== key) : prev.map(i => i.key === key ? { ...i, qty } : i));
    },
    remove: (key) => setCart(prev => prev.filter(i => i.key !== key)),
    clear: () => setCart([]),
    count: cart.reduce((s, i) => s + i.qty, 0),
    subtotal: cart.reduce((s, i) => {
      const p = window.SK.PRODUCTS.find(x => x.id === i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0),
  }), [cart, pushToast]);

  const toggleWish = React.useCallback((id) => {
    setWish(prev => {
      if (prev.includes(id)) { pushToast('Removed from wishlist'); return prev.filter(x => x !== id); }
      pushToast('Added to wishlist'); return [...prev, id];
    });
  }, [pushToast]);

  const setTweaks = React.useCallback((edits) => {
    setTweaksRaw(prev => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
  }, []);

  const value = { route, navigate, cart: cartApi, wish, toggleWish, pushToast, drawer, setDrawer,
                  toasts, tweaks, setTweaks, tweaksOpen, setTweaksOpen };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

function useStore() { return React.useContext(StoreCtx); }

window.useStore = useStore;
window.StoreProvider = StoreProvider;
