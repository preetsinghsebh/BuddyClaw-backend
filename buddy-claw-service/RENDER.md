# 🚀 Deployment Steps for Render

To deploy **Buddy Claw** on Render, follow these steps:

### 1. New Web Service
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Name**: `buddy-claw-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (This will run `node buddy-claw-service/index.js` as defined in `dostai/package.json`)

### 2. Environment Variables
In the **Environment** tab, add the following (Critical):

| Key | Value |
| --- | --- |
| `SARVAM_API_KEY` | your-sarvam-api-key |
| `MONGO_URI` | your-mongodb-uri |
| `BUDDY_CLAW_TOKEN` | your-telegram-bot-token |
| `PORT` | 3000 (Render usually sets this automatically) |
| `USE_WEBHOOK` | `false` (Keep false for polling, or `true` if you configure webhooks) |

### 3. Mongo Migration (Optional but Recommended)
If you want to move personas from the JSON file to your MongoDB:
1. Connect to your MongoDB.
2. Insert your persona records into a collection named `personas`.
3. The server will automatically detect and load them from Mongo next time it starts!

### 4. Health Checks
- **Health Check Path**: `/health`
- **Port**: `3000`

### 5. Deployment
Click **Create Web Service**. Your universal Buddy Claw bot will be live shortly! ✨
