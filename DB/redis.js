import Redis from "ioredis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config/.env") });

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});
console.log({ __dirname });

redis.on("error", (err) => {
  console.log("Redis error: " + err.message);
});

export default redis;
