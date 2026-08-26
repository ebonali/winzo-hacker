import { createApp } from "./server/app";

async function main() {
  const app = await createApp();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Color Trading Mastery] Server running at http://0.0.0.0:${PORT}`);
  });
}

main();
