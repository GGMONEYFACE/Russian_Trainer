import { Suspense } from "react";
import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Practice" },
  { href: "/practice/case-endings", label: "Case endings" },
  { href: "/reference", label: "Reference" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__ru">Русский</span>
          <span className="brand-mark__en">Trainer</span>
        </Link>
        <nav className="site-nav" aria-label="Main">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="site-nav__link">
              {link.label}
            </Link>
          ))}
          <Suspense fallback={<Link href="/login" className="site-nav__link">Login</Link>}>
            <AccountNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
