import Link from "next/link";
import Logo from "@/components/Logo";

/**
 * Landing page footer: brand and the three columns a product page needs —
 * where to go in the page, where to sign in, where the code lives.
 *
 * Styles live in app/page.js under the .ft- classes, since this footer is
 * part of the landing composition rather than the app chrome.
 */
export default function AppFooter() {
  return (
    <footer className="ng-container ft">
      <div className="ft-grid">
        <div className="ft-brand">
          <span className="ft-lockup">
            <Logo size={26} className="ft-mark" />
            NUTRIGAIN.
          </span>
          <p>
            A daily tracker for one athlete. Meals, macros and sets in one log, on one
            page, for as long as you want to use it.
          </p>
        </div>

        <div>
          <h3>Product</h3>
          <ul>
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/#how">How it works</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3>Account</h3>
          <ul>
            <li><Link href="/register">Get started free</Link></li>
            <li><Link href="/login">Sign in</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3>Project</h3>
          <ul>
            <li>
              <a href="https://github.com/chaudhary64/NutriGain" rel="noreferrer">
                Source code
              </a>
            </li>
            <li>
              <a href="https://github.com/chaudhary64/NutriGain/issues" rel="noreferrer">
                Issues
              </a>
            </li>
            <li><span className="ft-muted">Next.js 16 · MongoDB</span></li>
          </ul>
        </div>
      </div>

      <div className="ft-base">
        <span>© {new Date().getFullYear()} NutriGain</span>
        <span>Free to use, open source</span>
        <span>Your data stays in your database</span>
      </div>
    </footer>
  );
}
