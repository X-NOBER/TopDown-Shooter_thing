/**
 * Browser lobby ping (fetch /hi) needs CORS when the game and Colyseus are on different hosts.
 */
export function installCors(app) {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      const allowed = process.env.CORS_ORIGIN;
      if (allowed) {
        const list = allowed.split(",").map((entry) => entry.trim()).filter(Boolean);
        const ok = list.includes("*") || list.includes(origin);
        if (ok) res.setHeader("Access-Control-Allow-Origin", origin);
      } else if (process.env.NODE_ENV !== "production") {
        res.setHeader("Access-Control-Allow-Origin", origin);
      } else if (origin.endsWith(".onrender.com")) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
}