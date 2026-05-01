import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import CartDrawer from '@/components/storefront/CartDrawer';
import MobileMenu from '@/components/storefront/MobileMenu';
import ConfirmHost from '@/components/ui/ConfirmHost';
import { Settings, Category } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchSettings(): Promise<Settings | null> {
  try {
    const res = await fetch(`${API}/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchCategories(): Promise<Category[] | null> {
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [initialSettings, initialCategories] = await Promise.all([
    fetchSettings(),
    fetchCategories(),
  ]);

  return (
    <>
      <Header initialSettings={initialSettings} initialCategories={initialCategories} />
      <MobileMenu />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
      <ConfirmHost />
    </>
  );
}
