import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { corsOptions } from "./config/corsOptions.js";
import { errorHandler } from "./middleware/errorHandler.js";
dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬅️ Używamy TWOJEJ konfiguracji CORS
app.use(cors(corsOptions));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Smart Inventory AI API is running...");
});

// Test route POST
app.post("/echo", (req, res) => {
    res.json({
        received: req.body
    });
});

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
