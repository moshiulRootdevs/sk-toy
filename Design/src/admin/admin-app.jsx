/* Admin app root: routes the admin shell to the right page component */

function AdminApp() {
  const { route } = useAdmin();
  const head = route.split('/')[0] || 'dashboard';

  let page;
  switch (head) {
    case 'dashboard': page = <AdminDashboard />; break;
    case 'orders': page = <AdminOrders />; break;
    case 'products': page = <AdminProducts />; break;
    case 'customers': page = <AdminCustomers />; break;
    case 'reviews': page = <AdminReviews />; break;
    case 'coupons': page = <AdminCoupons />; break;
    case 'brands': page = <AdminBrands />; break;
    case 'categories': page = <AdminCategories />; break;
    case 'inventory': page = <AdminInventory />; break;
    case 'cms': page = <AdminPages />; break;
    case 'banners': page = <AdminBanners />; break;
    case 'navigation': page = <AdminNavigation />; break;
    case 'blog': page = <AdminBlog />; break;
    case 'homepage': page = <AdminHomepage />; break;
    case 'media': page = <AdminMedia />; break;
    case 'shipping': page = <AdminShipping />; break;
    case 'payments': page = <AdminPayments />; break;
    case 'reports': page = <AdminReports />; break;
    case 'audit': page = <AdminAuditLog />; break;
    case 'settings': page = <AdminSettings />; break;
    default: page = <AdminDashboard />;
  }

  return <AdminShell>{page}</AdminShell>;
}

/* Wrapper with provider */
function AdminRoot() {
  return <AdminProvider><AdminApp /></AdminProvider>;
}

window.AdminRoot = AdminRoot;
