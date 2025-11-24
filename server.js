import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { corsOptions } from "./config/corsOptions.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./middleware/logger.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(logger);               // logowanie requestów
app.use(cors(corsOptions));    // konfiguracja CORS
app.use(express.json());       // obsługa JSON

// Test route
app.get("/", (req, res) => {
    res.send("Smart Inventory AI API is running...");
});

app.post("/echo", (req, res) => {
    res.json({ received: req.body });
});

// ❗Middleware błędów — musi być na końcu
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
