'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfilePage = pathname?.startsWith('/profile');
  
  return (
    <main className={`min-h-screen transition-colors ${isProfilePage ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'}`}>
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
      <MainContent>{children}</MainContent>
    </SessionProvider>
  );
}

