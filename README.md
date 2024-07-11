# LeadConnector Integration API for  scheduling appointment from Zoho CRM contacts on GHL

This repository contains code for integrating with the LeadConnectorHQ API. LeadConnectorHQ is a platform that provides tools for managing calendars, appointments, and contacts.

## Setup

1. Clone the repository:

```bash
git clone https://github.com/LeNekoza/GoHighLevelExpressFlow.git
```
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:<br/>
Create a .env file in the root directory and add the following variables:
```bash
GHL_CLIENT_ID=your_client_id
GHL_CLIENT_SECRET=your_client_secret
LOCATION_ID=your_location_id
GROUP_ID=your_group_id
SIGN_IN=your_sign_in_url
```
<span style="font-size:0.9em; font-style:italic;">Replace your_client_id, your_client_secret, your_location_id, your_group_id, and your_sign_in_url with your actual values.
</span>

## Usage
Start the server
Run the following command to start the server:
```bash
npm start
```
## Endpoints
<h1>GET / </h1>
<ul>
<li>Description: Retrieve data from Redis and fetch calendar data from LeadConnectorHQ API.</li>
<li>Requires: Redis setup and access tokens.</li>
<li>Response: JSON data containing calendar information.</li>
</ul>
<h1>GET /generateAccess</h1>
<ul>
<li>Description: Generates access token.</li>
<li>Response: JSON containing access token.</li>
</ul>
<h1>GET /oauth</h1>
<ul>
<li>Description: OAuth endpoint for obtaining access token.</li>
<li>Requires: Authorization code from LeadConnectorHQ.</li>
<li>Response: JSON containing access token.</li>
</ul>
<h1>GET /rehydrate</h1>
<ul>
<li>Description: Refresh access token using refresh token.</li>
<li>Requires: Refresh token.</li>
<li>Response: JSON containing refreshed access token.</li>
</ul>
<h1>GET /accessToken</h1>
<ul>
<li>
Description: Get the current refresh token.</li>
<li>Response: JSON containing refresh token.</li>
</ul>
<h1>GET /freeslots</h1>
<ul>
<li>Description: Get free slots from a calendar.</li>
<li>Requires: Calendar ID, start date, end date, and timezone.</li>
<li>Response: JSON containing free slots data.
GET /deleteEverything</li>
<li>Description: Delete access and refresh tokens from Redis.</li>
<li>Response: JSON indicating success message.</li>
</ul>
<h1>GET /deleteAccess</h1>
<ul><li>Description: Delete access token from Redis.
Response: JSON indicating success message.</li>
</ul>
<h1>GET /bookMeeting</h1>
<ul><li>Description: Book a meeting.</li>
<li>Requires: Calendar ID, slot, first name, last name, email, and phone.</li>
<li>Response: JSON containing meeting data.</li>
</ul>
