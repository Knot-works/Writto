import puppeteer from "puppeteer";
import { preview } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

// Japanese topic slugs for SEO pages
const topicSlugsJa = [
  "eiken-grade1",
  "eiken-grade-pre1",
  "eiken-grade2",
  "eiken-grade-pre2",
  "eiken-grade3",
  "toeic-writing",
  "toefl-writing",
  "ielts-writing",
  "business-email",
  "english-diary",
];

// Korean topic slugs for SEO pages
const topicSlugsKo = [
  "toeic-writing",
  "toefl-writing",
  "ielts-writing",
  "business-email",
  "english-diary",
  "toeic-sw",
];

// Routes to prerender
const routes = [
  "/",
  "/pricing",
  "/about",
  "/faq",
  "/terms",
  "/privacy",
  "/contact",
  "/legal/commercial",
  // Japanese topic pages for SEO
  ...topicSlugsJa.map((slug) => `/topics/${slug}`),
  // Korean landing page
  "/ko",
  // Korean topic pages for SEO
  ...topicSlugsKo.map((slug) => `/ko/topics/${slug}`),
];

async function prerender() {
  console.log("Starting prerender...");

  // Start a preview server
  const server = await preview({
    preview: {
      port: 4173,
      strictPort: true,
    },
  });
  const serverUrl = server.resolvedUrls.local[0].replace(/\/$/, "");

  console.log(`Preview server running at ${serverUrl}`);

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const route of routes) {
      console.log(`Prerendering ${route}...`);
      const page = await browser.newPage();

      await page.goto(`${serverUrl}${route}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Wait for render-complete event or timeout
      await page.evaluate(() => {
        return new Promise((resolve) => {
          if (document.readyState === "complete") {
            setTimeout(resolve, 1000);
          } else {
            document.addEventListener("render-complete", () => resolve());
            setTimeout(resolve, 3000);
          }
        });
      });

      // Get the rendered HTML
      const html = await page.content();

      // Determine output path
      const outputPath =
        route === "/"
          ? path.join(distDir, "index.html")
          : path.join(distDir, route, "index.html");

      // Create directory if needed
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      // Write the prerendered HTML
      await fs.writeFile(outputPath, html);
      console.log(`  -> Saved to ${outputPath}`);

      await page.close();
    }

    console.log("Prerender complete!");
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
