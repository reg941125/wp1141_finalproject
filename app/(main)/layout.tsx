'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfilePage = pathname?.startsWith('/profile');
  
  return (
    <main className={`min-h-screen ${isProfilePage ? 'bg-white' : 'bg-gray-50'}`}>
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

