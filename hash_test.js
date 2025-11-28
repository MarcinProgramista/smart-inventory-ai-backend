import crypto from "crypto";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJpZCI6IjYifSwiaWF0IjoxNzY0MzQzNTg2LCJleHAiOjE3NjQ5NDgzODYsImF1ZCI6InNtYXJ0LWludmVudG9yeS11c2VycyIsImlzcyI6InNtYXJ0LWludmVudG9yeS1haSJ9.cZkHs6h7dTafr02qD5kwAIWYItl2ZXfZICHYBwou2S0"; // <-- wklej tu refresh token z mini_postman_cookies.json

const hash = crypto.createHash("sha256").update(token).digest("hex");
console.log("HASH:", hash);
