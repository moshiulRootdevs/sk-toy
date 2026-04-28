/* App root + router. Routes to admin panel when hash starts with `admin`. */

function App() {
  const { route, navigate } = useStore();

  // Global keyboard shortcut: Cmd/Ctrl + Shift + A to toggle admin
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        const h = window.location.hash.replace('#', '');
        if (h.startsWith('admin')) {
          window.location.hash = 'home';
        } else {
          window.location.hash = 'admin/dashboard';
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const page = React.useMemo(() => {
    const parts = route.split('/');
    const head = parts[0];
    if (head === '' || head === 'home') return <HomePage />;
    if (head === 'cat') return <CategoryPage slug={parts.slice(1).join('/')} />;
    if (head === 'p') return <ProductPage slug={parts[1]} />;
    if (head === 'cart') return <CartPage />;
    if (head === 'checkout') return <CheckoutPage />;
    if (head === 'track') return <TrackPage />;
    if (head === 'blog') return <BlogPage />;
    if (head === 'article') return <ArticlePage id={parts[1]} />;
    if (head === 'wishlist') return <WishlistPage />;
    if (head === 'brands') return <BrandsPage />;
    if (head === 'account') return <AccountPage />;
    if (head === 'sale') return <CategoryPage slug="sale" />;
    if (head === 'clearance') return <CategoryPage slug="clearance" />;
    if (head === 'damaged') return <CategoryPage slug="damaged" />;
    return <HomePage />;
  }, [route]);

  return (
    <div className="shell" data-screen-label={route || 'home'}>
      <Header />
      {page}
      <Footer />
      <CartDrawer />
      <Toasts />
      <TweaksPanel />
    </div>
  );
}

/* Top-level switch between storefront and admin panel.
   Listens to hashchange directly so we remount cleanly between the two apps,
   keeping admin state and storefront state cleanly separated. */
function Root() {
  const [isAdmin, setIsAdmin] = React.useState(() =>
    window.location.hash.replace('#', '').startsWith('admin')
  );

  React.useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      setIsAdmin(h.startsWith('admin'));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (isAdmin) return <AdminRoot />;
  return <StoreProvider><App /></StoreProvider>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
