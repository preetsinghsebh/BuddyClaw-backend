# 🚀 Deploying Buddy Claw Universal Bot to Render

Follow these exact steps to deploy your consolidated backend as a single service.

### 1. Unified Web Service Setup
1. Log in to [Render](https://dashboard.render.com).
2. Create a **New +** → **Web Service**.
3. Select your GitHub repository.
4. Set the following:
   - **Service Name**: `buddy-claw-bot`
   - **Runtime**: `Node`
   - **Root Directory**: `dostai`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (Runs `node buddy-claw-service/index.js`)

### 2. Environment Variables (Required)
Add these keys in the **Environment** tab (Render will inject `PORT` automatically):

| Key | Value | Description |
| --- | --- | --- |
| `TELEGRAM_TOKEN` | `your_bot_token` | Universal bot token from @BotFather |
| `MONGO_URI` | `your_db_uri` | MongoDB Atlas connection string |
| `SARVAM_API_KEY` | `your_api_key` | Sarvam.ai API key |

### 3. Safety Constraints (Already Implemented)
- **Polling Mode**: Hardcoded to `true` (No webhook setup needed).
- **Consolidated Engine**: Only one bot instance handles 27+ personas.
- **Port Binding**: Express server is active on `/health` to keep Render happy.

### 4. Verification & Debugging
- **Bot Check**: Message your bot on Telegram. It should respond with current persona behavior.
- **Health Check**: Open `https://your-service.onrender.com/health` in your browser.
- **Logs**: Check Render logs for:
  - `[Database] MongoDB Connected Successfully`
  - `[System] Buddy Claw Universal Bot is live and polling!`
- **No Response?**:
  - Verify `TELEGRAM_TOKEN` is correct.
  - Check if another instance of the bot is running elsewhere (e.g. your local terminal). Only one polling instance can be active at a time!

### 5. Final Checklist
- [x] `dostai/package.json` points to the correct engine.
- [x] Redundant service folders archived or removed.
- [x] Environment variables named correctly.

✨ **Buddy Claw is ready to serve!**
