// Force dynamic rendering for tutoring pages
export const dynamic = 'force-dynamic';

export default function TutoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

