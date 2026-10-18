import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
/* Meridian design system — shared tokens + components for every surface. */
import "./meridian.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import LenisProvider from "@/components/LenisProvider";
/* Geist — the app's type system (Geist Sans for UI + prose, Geist Mono for
   technical eyebrows, code, and tabular figures). Playfair stays scoped to
   the marketing page's display headings. */
const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "NutriGain - Track Your Macros",
  description: "Track your daily macros and achieve your fitness goals",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  themeColor: '#161619',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(){try{var t=localStorage.getItem('nutrigain_theme');if(t!=='light'&&t!=='dark'&&window.matchMedia('(prefers-color-scheme: dark)').matches){t='dark'}if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();",
          }}
        />
        <AuthProvider>
          <ThemeProvider>
            <LenisProvider>{children}</LenisProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
