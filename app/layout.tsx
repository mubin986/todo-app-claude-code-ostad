import type { Metadata } from "next";
import "./globals.css";
import FeedbackWidget from "./components/FeedbackWidget";

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo app built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Set the theme before paint: saved choice wins, else follow the OS.
            Keeps the toggle's default in sync and avoids a light/dark flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
