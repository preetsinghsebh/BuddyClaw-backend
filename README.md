# BuddyClaw Backend

BuddyClaw is a microservices-based AI companion ecosystem built on the **OpenClaw** agentic layer. It provides highly responsive AI companions with real memory, spontaneity, and distinct personalities.

## 🚀 Architecture

The backend consists of several microservices, each handling specific characters or core functionalities:

- **OpenClaw Service**: The central orchestrator for Telegram interactions and agentic logic.
- **Anime Service**: Powering anime-inspired AI characters.
- **Celeb Service**: Powering real-life icon simulations.
- **Liam, Ziva, etc.**: Dedicated services for specific core companions.
- **Sarvam Proxy**: A specialized proxy layer for Sarvam AI LLM integration.
- **Shared Logic**: Common utilities and persistence layers used across all services.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **AI Models**: Integrated via Sarvam AI
- **Deployment**: Configured for Render.com via `render.yaml`

## 📦 Getting Started

1.  Clone the repository.
2.  Install dependencies for all services:
    ```bash
    npm run install-all
    ```
3.  Configure your `.env` file with the necessary API keys and MongoDB URI.
4.  Start the services using PM2 or individual `npm start` commands:
    ```bash
    pm2 start ecosystem.config.cjs
    ```

## 👤 About the Creator

**BuddyClaw** is envisioned and developed by **Preet Singh**. 

The project aims to redefine AI companionship by moving beyond simple chat interfaces into a world of persistent, agentic entities that remember, grow, and interact with users across multiple platforms.

## 📜 License

Copyright © 2026 BuddyClaw. All rights reserved.
