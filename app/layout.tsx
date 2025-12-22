import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import PostHogProviderWrapper from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "家教網平台",
  description: "家教網平台 - 題目討論、家教配對、題目庫",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <PostHogProviderWrapper>
          <ThemeProvider>{children}</ThemeProvider>
        </PostHogProviderWrapper>
      </body>
    </html>
  );
}




