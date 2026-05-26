import type { NextConfig } from "next";

type BeforeCompileHook = {
  readonly tapPromise: (name: string, callback: () => Promise<void>) => void;
};

type VeliteCompiler = {
  readonly hooks: {
    readonly beforeCompile: BeforeCompileHook;
  };
};

const importVelite = new Function(
  "specifier",
  "return import(specifier)",
) as (specifier: "velite") => Promise<typeof import("velite")>;

class VeliteWebpackPlugin {
  private static started = false;

  apply(compiler: VeliteCompiler): void {
    compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
      if (VeliteWebpackPlugin.started) {
        return;
      }

      VeliteWebpackPlugin.started = true;
      const { build } = await importVelite("velite");
      await build();
    });
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/webp"],
  },
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
