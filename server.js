import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { corsOptions } from "./config/corsOptions.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./middleware/logger.js";
import { db } from "./db.js";
import { requireDB } from "./middleware/requireDB.js";
import registerRoute from "./routes/registerRoute.js";
import usersRoute from "./routes/usersRoute.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(requireDB); // <-- NOWE

app.get("/", (req, res) => {
  res.send("Smart Inventory AI API is running...");
});

// ❗ Test połączenia z DB
app.get("/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- HEALTH CHECKS ---

// Liveness probe (czy serwer żyje)
app.get("/live", (req, res) => {
  res.json({ status: "ok" });
});

// Readiness probe (czy gotowy przyjmować ruch)
app.get("/ready", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "db-down" });
  }
});

app.use("/api/register", registerRoute);
app.use("/api/users", usersRoute);
// Full health status
app.get("/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({
      status: "healthy",
      db: "connected",
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      db: "disconnected",
    });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
