import type { Metadata } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import StoreHydration from '@/providers/StoreHydration';
import { Toaster } from 'react-hot-toast';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SK Toy — Bangladesh's Favourite Toy Store",
  description: 'Shop the widest range of toys for every age. Safe, fun, and delivered to your door.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-[#1F2F4A]" suppressHydrationWarning>
        <QueryProvider>
          <StoreHydration />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1F2F4A',
                color: '#FFFFFF',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 600,
                padding: '12px 16px',
                boxShadow: '0 12px 28px -14px rgba(31,47,74,.45)',
              },
              success: {
                iconTheme: { primary: '#FF6FB1', secondary: '#FFFFFF' },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
