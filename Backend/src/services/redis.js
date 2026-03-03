import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });

client.on("error", (err) => console.error("Redis error:", err));

try {
  await client.connect();
  console.log("Redis connected");
} catch (err) {
  console.error("Redis connection failed - caching disabled:", err.message);
}

export default client;
