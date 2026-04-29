import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import StoreHydration from '@/providers/StoreHydration';
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SK Toy — Bangladesh's Favourite Toy Store",
  description: 'Shop the widest range of toys for every age. Safe, fun, and delivered to your door.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
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
