import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { corsOptions } from "./config/corsOptions.js";

dotenv.config();
const app = express();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
