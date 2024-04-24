import express from "express";
import { db } from "../redis/ds.js";
import axios from "axios";
import { URLSearchParams } from "url";
import refreshToken from "../utils/refreshToken.js";
import dotenv from "dotenv";
dotenv.config();
var router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  await db.set("key", "YES");
  const reply = await db.get("key");
  console.log("🚀Redis, you there?: ", reply);
  const token = await db.get("refresh_token");
  if (token) {
    const data = new URLSearchParams();
    data.set("locationId", `${process.env.LOCATION_ID}`);
    data.set("groupId", `${process.env.GROUP_ID}`);
    const access_token = await db.get("access_token");
    const options = {
      method: "GET",
      url: "https://services.leadconnectorhq.com/calendars/",
      headers: {
        Authorization: `Bearer ${access_token}`,
        Version: "2021-04-15",
        Accept: "application/json",
      },
      params: {
        locationId: process.env.LOCATION_ID,
        groupId: process.env.GROUP_ID,
      },
    };
    try {
      const response = await axios.request(options);

      return res.json({ data: response.data });
    } catch (err) {
      console.log(err); /* 
  res.json({error:err}) */
      await refreshToken().then((response) => {
        if (response.error) {
          return res.json({ error: response.error });
        } else {
          return res.json({ message: response.message });
        }
      });
    }
  } else {
    return res.json({ error: "Session not found" });
  }
});

router.get("/generateAccess", async function (req, res) {
  const client_id = process.env.GHL_CLIENT_ID;
  const client_secret = process.env.GHL_CLIENT_SECRET;
  res.render("index", {
    title: `🍍 ENV, you there?: ${client_id ? "YUP" : "NO!"}`,
  });
});

router.get("/oauth", async function (req, res) {
  //get params from the url
  const code = req.query.code ?? "";
  if (code.trim() == "") {
    db.disconnect();
    return res.render("oauth", { error: "No code found" });
  }
  const data = new URLSearchParams();
  data.set("code", code);
  data.set("client_id", process.env.GHL_CLIENT_ID);
  data.set("client_secret", process.env.GHL_CLIENT_SECRET);
  data.set("grant_type", "authorization_code");
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

    res.json({ key });
    res.render("oauth", { code: code });
  } catch (err) {
    res.render("oauth", { error: err });
  }
});

router.get("/rehydrate", async function (req, res) {
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

      res.json({ key });
    } catch (error) {
      console.error(error);

      res.redirect(process.env.SIGN_IN);
    }
  }
});

router.get("/accessToken", async function (req, res) {
  const token = await db.get("refresh_token");

  res.json({ token });
});
export default router;

router.get("/freeslots", async function (req, res) {
  const token = await db.get("refresh_token");
  if (token) {
    const data = new URLSearchParams();
    data.set("locationId", `${process.env.LOCATION_ID}`);
    data.set("groupId", `${process.env.GROUP_ID}`);
    const access_token = await db.get("access_token");
    const options = {
      method: "GET",
      url: "https://services.leadconnectorhq.com/calendars/",
      headers: {
        Authorization: `Bearer ${access_token}`,
        Version: "2021-04-15",
        Accept: "application/json",
      },
      params: {
        locationId: process.env.LOCATION_ID,
        groupId: process.env.GROUP_ID,
      },
    };
    try {
      const response = await axios.request(options);

      return res.json({ data: response.data });
    } catch (err) {
      console.log(err);
      await refreshToken().then((response) => {
        if (response.error) {
          return res.json({ error: response.error });
        } else {
          return res.json({ message: response.message });
        }
      });
    }
  } else {
    return res.json({ error: "Session not found" });
  }
});

router.get("/deleteEverything", async (req, res) => {
  await db.del("access_token");
  await db.del("refresh_token");

  return res.json({ message: "Deleted everything" });
});

router.get("/deleteAccess", async (req, res) => {
  await db.del("access_token");

  return res.json({ message: "Deleted access token" });
});
