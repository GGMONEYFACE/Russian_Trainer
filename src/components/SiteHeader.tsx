import { Suspense } from "react";
import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";
import { MobileNav } from "@/components/MobileNav";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Practice" },
  { href: "/practice/case-endings", label: "Case endings" },
  { href: "/practice/genitive", label: "Genitive" },
  { href: "/reference", label: "Resources" },
  { href: "/suggestions", label: "Suggestions" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__ru">Русский</span>
          <span className="brand-mark__en">Trainer</span>
        </Link>
        <MobileNav>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="site-nav__link">
              {link.label}
            </Link>
          ))}
          <Suspense
            fallback={
              <Link href="/login" className="site-nav__link">
                Login
              </Link>
            }
          >
            <AccountNav />
          </Suspense>
        </MobileNav>
      </div>
    </header>
  );
}
