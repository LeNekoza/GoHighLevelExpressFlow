import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 18452,
  },
});

let isConnected = false; // Flag to track connection state

client.on("connect", () => {
  console.log("Redis Database connected\n");
  isConnected = true;
});

client.on("error", (err) => {
  console.error("Something went wrong:", err);
});

// Handle disconnection gracefully (optional, for logging)
client.on("end", async () => {
  console.log("\nRedis client disconnected");
});

export const db = {
  async set(key, value) {
    try {
      if (!isConnected) {
        await client.connect();
      }
      await client.set(key, value);
      return "done";
    } catch (error) {
      console.error("Error setting key:", key, error);
      throw error; // Re-throw for caller handling
    }
  },
  async get(key) {
    try {
      if (!isConnected) {
        await client.connect();
      }
      const result = await client.get(key);
      return result;
    } catch (error) {
      console.error("Error getting key:", key, error);
      throw error; // Re-throw for caller handling
    }
  },
  async close() {
    await client.quit(); // Close the connection (optional for manual control)
  },
};
