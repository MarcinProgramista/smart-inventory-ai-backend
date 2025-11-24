import { db } from "../db.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
    const { name, email, password, password2 } = req.body;

    // 🔍 Basic validation
    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields are required" });

    if (password !== password2)
        return res.status(400).json({ message: "Passwords do not match" });

    if (password.length < 6)
        return res.status(400).json({ message: "Password must be at least 6 characters" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔄 Begin transaction
        await db.query("BEGIN");

        // 1️⃣ Create user (default role_id = 2 → worker)
        const newUser = await db.query(
            `INSERT INTO users (name, email, password, role_id) 
             VALUES ($1, $2, $3, $4)
             RETURNING id, email`,
            [name, email, hashedPassword, 2]
        );

        const userId = newUser.rows[0].id;

        // 2️⃣ Insert default categories FROM TABLE category_default
        await db.query(
            `
            INSERT INTO categories (user_id, name)
            SELECT $1, name FROM category_default
            `,
            [userId]
        );

        // 🔒 Commit transaction
        await db.query("COMMIT");

        return res.status(201).json({
            message: `User ${newUser.rows[0].email} registered successfully`,
            userId
        });

    } catch (error) {
        await db.query("ROLLBACK");
        console.error("Registration error:", error);
        return res.status(500).json({ error: "Registration failed" });
    }
};

