// Force dynamic rendering for chat pages
export const dynamic = 'force-dynamic';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}



