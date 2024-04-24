import express from 'express';
import client from '../redis/ds.js';
import axios from 'axios';
import {URLSearchParams} from 'url';
import dotenv from 'dotenv';
dotenv.config();

var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
 await client.connect();
  await client.set('key', 'YES');
 const reply = await client.get('key')
  console.log('🚀Redis, you there?: ', reply);
  const token = await client.get('refresh_token');
 if(token){
  const data = new URLSearchParams();
  data.set('locationId', `${process.env.LOCATION_ID}`);
  data.set('groupId',  `${process.env.GROUP_ID}`);
  const access_token = await client.get('access_token');
  const options = {
    method: 'GET',
    url: 'https://services.leadconnectorhq.com/calendars/',
    headers: {Authorization: `Bearer ${access_token}`, Version: '2021-04-15', Accept: 'application/json'},
    params: {locationId: process.env.LOCATION_ID, groupId: process.env.GROUP_ID},

  };
  try{
  const response = await axios.request(options);
  await client.disconnect();
  return res.render('index', { title: `🚀Redis, you there?: ${reply}`, data: JSON.stringify(response.data)});
}

catch(err){
  await client.disconnect();
  console.log(err);
  res.json({error:err})
  return res.redirect('/rehydrate')
}

}
else{
  await client.disconnect();
  return res.redirect(process.env.SIGN_IN)
}
});


router.get('/generateAccess',async function (req,res){
  await client.connect();
  const client_id = process.env.GHL_CLIENT_ID;
  const client_secret = process.env.GHL_CLIENT_SECRET;
  res.render('index', { title: `🍍 ENV, you there?: ${client_id?"YUP":"NO!"}`});
})

router.get('/oauth',async function (req,res){
  await client.connect();
  //get params from the url
  const code =  req.query.code??'';
  if(code.trim()==''){
    client.disconnect();
    return res.render('oauth',{error:'No code found'})
  }
  const data = new URLSearchParams()
  data.set('code',code)
  data.set('client_id',process.env.GHL_CLIENT_ID)
  data.set('client_secret',process.env.GHL_CLIENT_SECRET)
  data.set('grant_type','authorization_code')
  data.set('user_type','Location')
  const options = {
    method: 'POST',
    url: 'https://services.leadconnectorhq.com/oauth/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    data: data,
  };
  try{
    let oneMonthExpiry = 60 * 60 * 24 * 30;
    const { data } = await axios.request(options);
    console.log(data);
    await client.set('access_token',data.access_token,{
      EX: data.expires_in
    });
    const key = await client.get('access_token')
    await client.set('refresh_token',data.refresh_token,{
      EX: oneMonthExpiry
    });
    await client.disconnect();
    res.json({key})
    res.render('oauth',{code:code})

  }
  catch(err){
    await client.disconnect();
    res.render('oauth',{error:err})
  }

})

router.get('/rehydrate',async function (req,res){
  await client.connect();
  const refresh_token = await client.get('refresh_token');
  if(refresh_token){
    const data = new URLSearchParams()
    data.set('refresh_token',refresh_token)
    data.set('client_id',process.env.GHL_CLIENT_ID)
    data.set('client_secret',process.env.GHL_CLIENT_SECRET)
    data.set('grant_type','refresh_token')
    data.set('user_type','Location')
    const options = {
      method: 'POST',
      url: 'https://services.leadconnectorhq.com/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      data: data,
    };

    try {
      let oneMonthExpiry = 60 * 60 * 24 * 30;
      const { data } = await axios.request(options);
      console.log(data);
      await client.set('access_token',data.access_token,{
        EX: data.expires_in
      });
      const key = await client.get('access_token')
      await client.set('refresh_token',data.refresh_token,{
        EX: oneMonthExpiry
      });
      await client.disconnect();
      res.json({key})
      
    } catch (error) {
      console.error(error);
      await client.disconnect();
      res.redirect(process.env.SIGN_IN)
    }    
  }
})

router.get('/accessToken',async function (req,res){
  await client.connect();
  const token = await client.get('refresh_token');
  await client.disconnect();
  res.json({token})
})
export default router;

router.get('/freeslots',async function (req,res){
  await client.connect();
  const token = await client.get('refresh_token');
  if(token){
    const data = new URLSearchParams();
    data.set('locationId', `${process.env.LOCATION_ID}`);
    data.set('groupId',  `${process.env.GROUP_ID}`);
    const access_token = await client.get('access_token');
    const options = {
      method: 'GET',
      url: 'https://services.leadconnectorhq.com/calendars/',
      headers: {Authorization: `Bearer ${access_token}`, Version: '2021-04-15', Accept: 'application/json'},
      params: {locationId: process.env.LOCATION_ID, groupId: process.env.GROUP_ID},
  
    };
    try{
    const response = await axios.request(options);
    await client.disconnect();
    return res.render('index', { title: `🚀Redis, you there?: ${reply}`, data: JSON.stringify(response.data)});
  }
  
  catch(err){
    await client.disconnect();
    console.log(err);
    res.json({error:err})
    return res.redirect('/rehydrate')
  }
  
  }
  else{
    await client.disconnect();
    return res.redirect(process.env.SIGN_IN)
  }
  }
)