"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./Navbar.module.css";
import Link from 'next/link'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#problems", label: "O Problema" },
    { href: "#solutions", label: "A Solução" },
    { href: "#pricing", label: "Preços" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className={[styles.navbar, isScrolled ? styles.scrolled : ""].join(" ")} role="banner">
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
            aria-label="Entrar na lista de espera"
          >
            Entrar na Waitlist
          </Button>

          {/* Mobile hamburger */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className={[styles.hamburger, isMobileMenuOpen ? styles.open : ""].join(" ")} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <nav className={styles.mobileNav} aria-label="Navegação mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className={styles.mobileNavCta}>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Entrar na Waitlist
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
