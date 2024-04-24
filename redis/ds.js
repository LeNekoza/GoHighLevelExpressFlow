import { createClient } from "redis";
import dotenv from 'dotenv';
dotenv.config();
const client = await createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 18452,
    }
}).on('error', err => console.log('Redis Client Error', err)).connect();
  
await client.disconnect();
export default client;
