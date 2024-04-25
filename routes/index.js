import express from "express";
import { db } from "../redis/ds.js";
import axios from "axios";
import { URLSearchParams } from "url";
import refreshToken from "../utils/refreshToken.js";
import dotenv from "dotenv";
import { time } from "console";
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
      await refreshToken().then(async(response) => {
        if (response.error) {
         return res.json({ error: response.error });

        } else {
          try{
            const token = await db.get("refresh_token");
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
            const lasttry = await axios.request(options);
            return res.json({ data: lasttry.data });
        }
        catch(err){
          console.log(err);
          res.json({error:err});
        }
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
  //if no request params
  if (!req.query) {
    return res.json({ error: "No request params" });
  }
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const calendarId = req.query.calendarId;
  const timezone = req.query.timezone;
  const token = await db.get("refresh_token");
  if (token) {
    const access_token = await db.get("access_token");
    const options = {
      method: "GET",
      url: `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots`,
      headers: {
        Authorization: `Bearer ${access_token}`,
        Version: "2021-04-15",
        Accept: "application/json",
      },
      params: {
        timezone: timezone,
        userId: "mQ5WIXoPLqQBairj0JYU",
        startDate: startDate,
        endDate: endDate,
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

router.get("/bookMeeting", async (req, res) => {
  let contactId;
  const { calendar,slot, firstName, lastName, email, phone } = req.query;
  const locationId = process.env.LOCATION_ID;
 /*  const userId = "mQ5WIXoPLqQBairj0JYU"; */
  const access_token = await db.get("access_token");
  //check if user is already in the system
  try{
  const options = {
    method: "GET",
    url: `https://services.leadconnectorhq.com/contacts/`,
    headers: {
      Authorization: `Bearer ${access_token}`,
      Version: "2021-04-15",
      Accept: "application/json",
    },
    params: {
      query: email,
      locationId: locationId,
    },
  };
  const data = await axios.request(options).then(async(response) => {
    if(response.data.contacts.length > 0){
      /* return response.data.contacts[0].id; */
      contactId = await response.data.contacts[0].id;
      //create a meeting
      const params = new URLSearchParams();
      params.set("calendarId", calendar.toString());
      params.set("contactId", contactId.toString());
      params.set("locationId", locationId);
      params.set("startTime", slot.toString());

      const options = {
        method: "POST",
        url: `https://services.leadconnectorhq.com/calendars/events/appointments`,
        headers: {
          Authorization: `Bearer ${access_token}`,
          Version: "2021-04-15",
          Accept: "application/json",
        },
        data: params,
      };
      try{
      await axios.request(options).then((response) => 
       res.json({ data: response.data})
    ) 
    }
      catch(err){
        console.log(err);
        res.json({error:err});
      }

    }
    else{
      throw new Error("User not found");
    }
  })
  console.log(data);
  res.json({ data: data });
  }
  catch(err){
    if(err.message === "User not found"){
      const data = new URLSearchParams();
      data.set("firstName", firstName);
      data.set("lastName", lastName);
      data.set("email", email);
      data.set("phone", phone);
      data.set("locationId", locationId);
      const options = {
        method: "POST",
        url: `https://services.leadconnectorhq.com/contacts/`,
        headers: {
          Authorization: `Bearer ${access_token}`,
          Version: "2021-04-15",
          Accept: "application/json",
        },
        data: data,
      };
      try{
      const response = await axios.request(options);
      contactId = await response.data.id;
      //create a meeting
      const params = new URLSearchParams();
      params.set("calendarId", calendar.toString());
      params.set("contactId", contactId.toString());
      params.set("locationId", locationId);
      params.set("startTime", slot.toString());

      const opts =  {
        method: "POST",
        url: `https://services.leadconnectorhq.com/calendars/events/appointments`,
        headers: {
          Authorization: `Bearer ${access_token}`,
          Version: "2021-04-15",
          Accept: "application/json",
        },
        data: params,
      };
      try{
      await axios.request(opts).then((response) => 
       res.json({ data: response.data})
    ) 
    }
      catch(err){
        console.log(err);
        res.json({error:err});
      }
      

    }
    catch(err){
      console.log(err);
      res.json({error:err});
    }
  }
  }
  });