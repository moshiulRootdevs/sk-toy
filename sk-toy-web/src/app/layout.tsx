import type { Metadata } from 'next';
import { Inter, Fredoka, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import StoreHydration from '@/providers/StoreHydration';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-var',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SK Toy — Bangladesh's Favourite Toy Store",
  description: 'Shop the widest range of toys for every age. Safe, fun, and delivered to your door.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FBF4E8] text-[#1F2F4A]" suppressHydrationWarning>
        <QueryProvider>
          <StoreHydration />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1F2F4A',
                color: '#FFFBF2',
                borderRadius: '10px',
                fontSize: '13px',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
