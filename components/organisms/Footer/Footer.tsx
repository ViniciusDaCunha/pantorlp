import React from "react";
import styles from "./Footer.module.css";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export function Footer() {
  const ref = useIntersectionObserver('visible');
  const currentYear = new Date().getFullYear();
  return (
    <footer ref={ref} className={styles.footer} role="contentinfo">
      <div className={["content-container"].join(" ")}>
        <div className={styles.footerMain}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.footerLogoText}>Pantor</span>
            </div>
            <p className={styles.footerTagline}>
              Wide events. Zero silos. Full context.
            </p>
            <p className={styles.footerDescription}>
              Plataforma de observabilidade baseada em wide events para times
              que desenvolvem na velocidade da IA.
            </p>
          </div>

          {/* Links */}
          <nav className={styles.footerLinks} aria-label="Links do rodapé">
            <div className={styles.footerLinkGroup}>
              <span className={styles.footerLinkGroupTitle}>Produto</span>
              <a href="#solutions" className={styles.footerLink}>Como funciona</a>
              <a href="#pricing" className={styles.footerLink}>Preços</a>
              <a href="#waitlist" className={styles.footerLink}>Early Access</a>
            </div>
            <div className={styles.footerLinkGroup}>
              <span className={styles.footerLinkGroupTitle}>Empresa</span>
              <a href="#" className={styles.footerLink}>Sobre nós</a>
              <a href="#" className={styles.footerLink}>Blog</a>
              <a href="mailto:hello@pantor.dev" className={styles.footerLink}>Contato</a>
            </div>
           

            {/*
            <div className={styles.footerLinkGroup}>
              <span className={styles.footerLinkGroupTitle}>Legal</span>
              <a href="#" className={styles.footerLink}>Privacidade</a>
              <a href="#" className={styles.footerLink}>Termos de Uso</a>
              <a href="#" className={styles.footerLink}>Cookies</a>
            </div>
            */}
            

          </nav>
        </div>

        <div className={styles.footerBottom}>
          <span className={styles.footerCopyright}>
            © {currentYear} Pantor. Construído para desenvolvedores.
          </span>
          <div className={styles.footerStatusBadge}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>Todos os sistemas operacionais</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
