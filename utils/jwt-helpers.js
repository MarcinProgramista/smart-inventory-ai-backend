import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

const jwtTokens = ({ id, name, email }) => {
  // Payload z istotnymi danymi użytkownika
  const accessTokenPayload = {
    UserInfo: {
      id: id,
      name: name,
      email: email,
    },
  };

  const refreshTokenPayload = {
    UserInfo: {
      id: id,
    },
  };

  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
      algorithm: "HS256",
      issuer: "smart-inventory-ai",
      audience: "smart-inventory-users",
    }
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d", // Zwiększone z 1h do 7 dni
      algorithm: "HS256",
      issuer: "smart-inventory-ai",
      audience: "smart-inventory-users",
    }
  );

  return { accessToken, refreshToken };
};

export default jwtTokens;
