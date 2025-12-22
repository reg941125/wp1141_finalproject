// Force dynamic rendering for all main pages
export const dynamic = 'force-dynamic';

import LayoutWrapper from './layout-wrapper';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
