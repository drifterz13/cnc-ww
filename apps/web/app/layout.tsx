import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { IBM_Plex_Sans_Thai, Inter, Roboto } from 'next/font/google';
import { Toaster } from 'sonner';
import { NoticeToast } from '@/components/notice-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto',
});

const ibmPlexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['500', '700'],
  variable: '--font-ibm-thai',
});

export const metadata: Metadata = {
  title: 'Concert Wow',
  description: 'Concert discovery and reservation',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${roboto.variable} ${ibmPlexThai.variable}`}
    >
      <body className={inter.className}>
        {children}
        <Toaster closeButton position="top-right" richColors />
        <Suspense fallback={null}>
          <NoticeToast />
        </Suspense>
      </body>
    </html>
  );
}
