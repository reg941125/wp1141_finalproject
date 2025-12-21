'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/Navbar';

function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen transition-colors bg-transparent">
      {children}
    </main>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <MainContent>{children}</MainContent>
      </div>
    </SessionProvider>
  );
}

