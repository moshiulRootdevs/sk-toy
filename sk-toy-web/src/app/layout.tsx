import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sktoy.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SK Toy — Buy Toys Online in Bangladesh | Best Toy Shop Dhaka",
    template: '%s | SK Toy',
  },
  description: 'Bangladesh\'s favourite online toy store. Shop 1,200+ safe, educational & fun toys for all ages. Fast delivery across Dhaka & nationwide. Trusted by thousands of parents.',
  keywords: 'buy toys online Bangladesh, toy shop Dhaka, kids toys BD, educational toys, baby toys, SK Toy, toys for children Bangladesh',
  authors: [{ name: 'SK Toy', url: SITE_URL }],
  creator: 'SK Toy',
  publisher: 'SK Toy',
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    url: SITE_URL,
    siteName: 'SK Toy',
    title: "SK Toy — Buy Toys Online in Bangladesh | Best Toy Shop Dhaka",
    description: 'Bangladesh\'s favourite online toy store. Shop 1,200+ safe, educational & fun toys for all ages. Fast delivery across Dhaka & nationwide.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'SK Toy — Bangladesh\'s Favourite Toy Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "SK Toy — Buy Toys Online in Bangladesh",
    description: 'Shop 1,200+ safe, educational & fun toys. Fast delivery across Bangladesh.',
    images: ['/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: SITE_URL },
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
