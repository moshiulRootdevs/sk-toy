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
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* User links */}
          <div className="px-4 py-3 border-b border-gray-100 flex gap-2">
            <Link
              href={customer ? '/account' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center text-sm font-medium py-2 bg-[#EC5D4A] text-white rounded-lg"
            >
              {customer ? 'My Account' : 'Login'}
            </Link>
            {!customer && (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center text-sm font-medium py-2 border border-gray-200 rounded-lg text-gray-700"
              >
                Register
              </Link>
            )}
          </div>

          {/* Navigation */}
          <div className="py-2">
            {(nav || []).map((item) => (
              <div key={item._id}>
                <Link
                  href={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="text-xs bg-[#EC5D4A] text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </span>
                </Link>
                {item.children?.map((child, ci) => (
                  <Link
                    key={ci}
                    href={child.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block pl-10 pr-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Categories */}
          {cats && cats.length > 0 && (
            <div className="border-t border-gray-100 py-2">
              <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
              {cats.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Extra links */}
          <div className="border-t border-gray-100 py-2">
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Wishlist
            </Link>
            <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
