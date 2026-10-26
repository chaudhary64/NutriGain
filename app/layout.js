import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
/* Meridian design system — shared tokens + components for every surface. */
import "./meridian.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import LenisProvider from "@/components/LenisProvider";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getJwtSecret } from "@/lib/auth";
/* Geist — the app's type system, shared by the dashboard and the landing
   page (Geist Sans for UI, prose and display; Geist Mono for technical
   eyebrows, code and tabular figures). Playfair remains on the error and
   404 pages. */
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
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

const THEME_COOKIE = 'ng_theme';
const CANVAS = { light: '#fafafa', dark: '#0a0a0a' };

const isTheme = (value) => value === 'light' || value === 'dark';

/**
 * The theme the very first paint should use, and whether it is authoritative.
 *
 * Browser storage cannot answer this on the server, and the account theme
 * cannot be read before the auth request settles — which is why a client-only
 * provider painted the OS theme and then swapped to the account's one. The
 * server can answer it from two places, in order of authority:
 *
 *   1. the signed-in account, from the session token already in the request;
 *   2. the preference cookie, written whenever a theme is applied on a device.
 *
 * Account first, so this agrees with what the provider adopts once /api/auth/me
 * returns — one order everywhere, and no swap when the two disagree.
 *
 * resolved:false means neither existed (a first visit). The inline script then
 * resolves the OS preference before anything paints, so that case is still
 * flash-free — there is simply no saved preference to contradict yet.
 */
async function resolveFirstPaintTheme() {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    return { theme: 'light', resolved: false };
  }

  const token = cookieStore.get('token')?.value;
  if (token) {
    try {
      const { userId } = jwt.verify(token, getJwtSecret());
      await dbConnect();
      const account = await User.findById(userId).select('theme').lean();
      if (isTheme(account?.theme)) return { theme: account.theme, resolved: true };
    } catch {
      /* Bad or expired token: fall back to the device preference below. */
    }
  }

  const preference = cookieStore.get(THEME_COOKIE)?.value;
  if (isTheme(preference)) return { theme: preference, resolved: true };

  return { theme: 'light', resolved: false };
}

export default async function RootLayout({ children }) {
  const { theme, resolved } = await resolveFirstPaintTheme();

  return (
    <html
      lang="en"
      data-theme={theme}
      data-theme-resolved={resolved ? '1' : '0'}
      style={{ colorScheme: theme, backgroundColor: CANVAS[theme] }}
      suppressHydrationWarning
    >
      <body
        className={`${geist.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Runs while the body is still being parsed, so whatever it decides is
            on <html> before anything below is painted.

            It only *decides* when the server could not: data-theme-resolved="1"
            means the account or a stored preference already won, and the OS
            preference must not be allowed to overrule it after the fact. That
            gate is the whole fix — the old script always fell back to the OS
            theme, so a signed-in visitor with a light account on a dark OS got
            dark paint and a light page a second later.

            It must always end on a concrete value: leaving the attribute off
            and relying on the CSS default is what paints one theme and then
            swaps to the other. color-scheme and the canvas colour move with it
            so native scrollbars and the bare document background match before
            CSS arrives, not after hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement,t=null;" +
              "if(d.getAttribute('data-theme-resolved')!=='1'){" +
              "try{var s=localStorage.getItem('nutrigain_theme');if(s==='light'||s==='dark')t=s}catch(e){}" +
              "if(!t){try{t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){t='light'}}" +
              "if(t&&d.getAttribute('data-theme')!==t)d.setAttribute('data-theme',t)" +
              "}var a=d.getAttribute('data-theme')||'light';" +
              "d.style.colorScheme=a;d.style.backgroundColor=a==='dark'?'#0a0a0a':'#fafafa';" +
              "})();",
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
