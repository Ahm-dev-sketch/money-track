import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  "v1";

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [
      { url: "/~offline", revision },
      // Static-export route HTML files. Serwist's default glob only captures
      // `.next/static/**` + `public/**`, so these must be precached explicitly
      // for cold-start offline navigations to work.
      { url: "/index.html", revision },
      { url: "/analytics.html", revision },
      { url: "/history.html", revision },
      { url: "/wallets.html", revision },
      { url: "/settings.html", revision },
    ],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
