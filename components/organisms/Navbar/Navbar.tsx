import styles from "./Navbar.module.css";
import buttonStyles from "@/components/atoms/Button/Button.module.css";
import Link from 'next/link'

export function Navbar() {
  const navLinks = [
    { href: "#problems", label: "O Problema" },
    { href: "#solutions", label: "A Solução" },
    { href: "#pricing", label: "Preços" },
    { href: "#blog", label: "Blog" },
  ];

  return (
    <header className={styles.navbar} role="banner">
      <div className={[styles.navbarInner, "content-container"].join(" ")}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="Pantor - Página inicial">
          <span className={styles.logoText}>Pantor</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>{link.label}</a>
          ))}
        </nav>

        {/* CTA */}
        <div className={styles.navActions}>
          <a
            href="#waitlist"
            className={[buttonStyles.button, buttonStyles.primary, buttonStyles.sm].join(" ")}
          >
            Entrar na Waitlist
          </a>

          {/* Mobile hamburger */}
          <details className={styles.mobileMenu}>
            <summary className={styles.mobileMenuButton} aria-label="Abrir menu">
              <span className={styles.hamburger} aria-hidden="true" />
            </summary>
            <nav className={styles.mobileNav} aria-label="Navegação mobile">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={styles.mobileNavLink}
                >
                  {link.label}
                </a>
              ))}
              <div className={styles.mobileNavCta}>
                <a
                  href="#waitlist"
                  className={[buttonStyles.button, buttonStyles.primary, buttonStyles.md].join(" ")}
                >
                  Entrar na Waitlist
                </a>
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
