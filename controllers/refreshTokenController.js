import { db } from "../db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    // Hashujemy token tak jak przy logowaniu
    const hashedToken = hashToken(refreshToken);

    const foundUser = await db.query("SELECT * FROM users WHERE token = $1", [
      hashedToken,
    ]);

    if (foundUser.rows.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const user = foundUser.rows[0];

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      {
        issuer: "smart-inventory-ai",
        audience: "smart-inventory-users",
      },
      (error, decoded) => {
        if (error) {
          console.error("JWT verification failed:", error);
          return res.status(403).json({ error: "Invalid token" });
        }

        // NOWY ACCESS TOKEN – identyczny payload jak w jwtTokens()
        const accessToken = jwt.sign(
          {
            UserInfo: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15m",
            algorithm: "HS256",
            issuer: "smart-inventory-ai",
            audience: "smart-inventory-users",
          }
        );

        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getRefreshToken };
