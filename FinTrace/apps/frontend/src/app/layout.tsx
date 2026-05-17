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
      <body className="bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
