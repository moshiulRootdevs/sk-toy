'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUIStore, useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { NavigationItem, Category } from '@/types';

export default function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { customer } = useAuthStore();

  const { data: nav } = useQuery<NavigationItem[]>({
    queryKey: ['navigation'],
    queryFn: () => api.get('/navigation').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: cats } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#1F2F4A]/45 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#FFE0EC]"
             style={{ background: 'linear-gradient(135deg,#FFE0EC,#FFEDB6)' }}>
          <span className="font-display font-extrabold text-lg text-[#1F2F4A]">🌈 Menu</span>
          <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 rounded-full bg-white text-[#FF6FB1] hover:bg-[#FFE0EC] flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* User links */}
          <div className="px-4 py-3 border-b-2 border-[#FFE0EC] flex gap-2">
            <Link
              href={customer ? '/account' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center text-sm font-extrabold py-2.5 text-white rounded-full"
              style={{ background: 'linear-gradient(135deg,#FF5B6E,#FF6FB1)', boxShadow: '0 8px 18px -8px rgba(255,91,110,.5)' }}
            >
              {customer ? 'My Account' : 'Login'}
            </Link>
            {!customer && (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center text-sm font-extrabold py-2.5 border-2 border-[#FFD4E6] rounded-full text-[#FF6FB1] bg-white"
              >
                Register
              </Link>
            )}
          </div>

          {/* Navigation */}
          <div className="py-2">
            {(nav || []).filter((item) => item.label?.trim().toLowerCase() !== 'brands').map((item) => (
              <div key={item._id}>
                <Link
                  href={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-3 text-sm font-bold text-[#1F2F4A] hover:bg-[#FFF5F8] hover:text-[#FF6FB1] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="text-[10px] bg-[#FF6FB1] text-white px-2 py-0.5 rounded-full font-extrabold uppercase">{item.badge}</span>
                    )}
                  </span>
                </Link>
                {item.children?.map((child, ci) => (
                  <Link
                    key={ci}
                    href={child.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block pl-10 pr-5 py-2.5 text-sm text-[#5A5048] hover:bg-[#FFF5F8] font-medium"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Categories */}
          {cats && cats.length > 0 && (
            <div className="border-t-2 border-[#FFE0EC] py-2">
              <p className="px-5 py-2 text-[10px] font-extrabold text-[#FF6FB1] uppercase tracking-[.16em] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6FB1]" /> Categories
              </p>
              {cats.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm text-[#1F2F4A] hover:bg-[#FFF5F8] font-semibold"
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Extra links */}
          <div className="border-t-2 border-[#FFE0EC] py-2">
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-[#1F2F4A] hover:bg-[#FFF5F8] font-semibold">
              <svg className="w-4 h-4 text-[#FF6FB1]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Wishlist
            </Link>
            <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-[#1F2F4A] hover:bg-[#FFF5F8] font-semibold">
              <svg className="w-4 h-4 text-[#6BC8E6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
