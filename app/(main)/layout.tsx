'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfilePage = pathname?.startsWith('/profile');
  const isChatPage = pathname?.startsWith('/chat');
  
  return (
    <main className={`min-h-screen transition-colors ${isProfilePage ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'} ${isChatPage ? 'h-screen overflow-hidden' : ''}`}>
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
      <LayoutContent>{children}</LayoutContent>
    </SessionProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith('/chat');
  
  return (
    <>
      {!isChatPage && <Navbar />}
      <MainContent>{children}</MainContent>
    </>
  );
}

