import axios from "axios";
import dotenv from "dotenv";
import { db } from "../redis/ds.js";
import { URLSearchParams } from "url";

dotenv.config();

export default async function () {
  const refresh_token = await db.get("refresh_token");
  if (refresh_token) {
    const data = new URLSearchParams();
    data.set("refresh_token", refresh_token);
    data.set("client_id", process.env.GHL_CLIENT_ID);
    data.set("client_secret", process.env.GHL_CLIENT_SECRET);
    data.set("grant_type", "refresh_token");
    data.set("user_type", "Location");
    const options = {
      method: "POST",
      url: "https://services.leadconnectorhq.com/oauth/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      data: data,
    };

    try {
      let oneMonthExpiry = 60 * 60 * 24 * 30;
      const { data } = await axios.request(options);
      console.log(data);
      await db.set("access_token", data.access_token, {
        EX: data.expires_in,
      });
      const key = await db.get("access_token");
      await db.set("refresh_token", data.refresh_token, {
        EX: oneMonthExpiry,
      });

      return { message: key };
    } catch (error) {
      console.error(error);

      return { error: "Refresh Token not valid. Please login again." };
    }
  }
}
