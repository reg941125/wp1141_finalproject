// Force dynamic rendering for library pages
export const dynamic = 'force-dynamic';

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


