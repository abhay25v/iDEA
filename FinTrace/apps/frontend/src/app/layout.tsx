// Layout Component

import React from 'react';
import '@/app/globals.css';

export const metadata = {
  title: 'FinTrace - Fraud Detection',
  description: 'AI-Powered Banking Fraud Detection Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
