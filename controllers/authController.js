import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwtTokens from "../utils/jwt-helpers.js";
import crypto from "crypto";

const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Pobranie użytkownika
    const foundUser = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (foundUser.rows.length === 0) {
      return res.status(401).json({ error: "Email is incorrect" });
    }

    const user = foundUser.rows[0];

    // Sprawdzenie hasła
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generowanie tokenów
    const tokens = jwtTokens({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Hashowanie refresh tokena
    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(tokens.refreshToken)
      .digest("hex");

    // Zapis do bazy
    await db.query("UPDATE users SET token = $1 WHERE id = $2", [
      hashedRefreshToken,
      user.id,
    ]);

    // Ustawienie cookie
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // dla HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
    });

    res.status(200).json({
      accessToken: tokens.accessToken,
      user_id: user.id,
      name: user.name,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export { handleLogin };
