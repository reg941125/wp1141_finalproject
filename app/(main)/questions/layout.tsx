// Force dynamic rendering for questions pages
export const dynamic = 'force-dynamic';

export default function QuestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

