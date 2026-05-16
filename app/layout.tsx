import type { Metadata } from "next";
import "./globals.css";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Pantor — Observabilidade com Wide Events para Times de Dev",
  description:
    "Feche o loop entre desenvolvimento e produção em menos de 15 minutos. Wide events substituem logs, métricas e traces — tudo em um único evento rico. Custo previsível, zero silos.",
  keywords: [
    "observabilidade", "wide events", "monitoramento", "logs", "métricas",
    "traces", "developer tools", "SaaS", "startup", "Node.js", "OpenTelemetry",
  ],
  authors: [{ name: "Pantor" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pantor.dev",
    siteName: "Pantor",
    title: "Pantor — Wide Events. Zero Silos. Full Context.",
    description:
      "Primeiro evento em produção em 15 minutos. Sem surpresas na fatura. Observabilidade para times que desenvolvem na velocidade da IA.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pantor — Plataforma de Observabilidade com Wide Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pantor — Wide Events. Zero Silos.",
    description: "Observabilidade para times modernos. Setup em 15 min.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Pantor",
              applicationCategory: "DeveloperApplication",
              description:
                "Plataforma SaaS de observabilidade baseada em wide events para times de desenvolvimento.",
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "BRL",
                lowPrice: 75,
                highPrice: 990,
              },
              operatingSystem: "Web",
              url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pantor.dev",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
