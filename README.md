<img src="./chad.jpg" alt="Chadbot" width="130" align="left" style="border-radius: 10px; margin-right: 20px; margin-bottom: 15px;" />

# CHADBOT

This is Chadbot, a bot made by me for Discord servers. It brings witty banter, sarcastic Hinglish roasts, and fun interactions to keep chat active and lively.

<br clear="all" />


## Usecases & Commands

- **`/roast`**: Savage Hinglish roasts targeted at a friend (or right-click any user/message -> *Apps* -> *Roast User* / *Roast This*).
- **`/ask`**: Ask any question and get a sarcastic, sharp-witted response.
- **`/gif`**: Drops relatable reaction GIFs directly into chat.
- **`/spice`**: Adjust roast heat level for yourself from 1 (mild) to 5 (savage).
- **`/chadadmin`**: Server admin dashboard to manage settings & toggle features.

---

## Stack

- **Discord Framework**: [Discord.js v14](https://discord.js.org/)
- **Database & ORM**: [Prisma ORM 7](https://www.prisma.io/) with SQLite (`better-sqlite3`)
- **AI Brain**: Multi-provider failover engine supporting [Groq](https://groq.com/), [Google Gemini](https://ai.google.dev/), and [OpenRouter](https://openrouter.ai/)

---

## NPM Commands

| Command | Description |
|---|---|
| `npm start` | Starts the bot in production mode (`node server/index.js`) |
| `npm run dev` | Starts the bot with auto-reload watch mode |
| `npm run deploy:commands` | Deploys and registers slash commands with Discord |
| `npm run check:ai` | Tests connectivity and response for configured AI providers |
| `npm run check:gif` | Verifies GIF API connectivity |
| `npm run db:migrate` | Runs Prisma database migrations and regenerates client |
| `npm run db:deploy` | Applies pending migrations in production |
| `npm run db:studio` | Opens Prisma Studio web UI to inspect/edit database tables |

---

## Setup & Configure

1. **Clone & install dependencies:**
   ```bash
   git clone https://github.com/adityajha-coder/CHAD-BOT.git
   cd CHAD-BOT
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   # Discord
   DISCORD_TOKEN=your_bot_token
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_GUILD_ID=your_guild_id

   # Database
   DATABASE_URL=file:./data/chadbot.db

   # AI Providers
   PROVIDER_ORDER=groq,gemini,openrouter
   GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key

   # GIF Providers
   GIF_ORDER=klipy,giphy
   KLIPY_API_KEY=your_klipy_api_key
   GIPHY_API_KEY=your_giphy_api_key
   ```

3. **Deploy slash commands:**
   ```bash
   npm run deploy:commands
   ```

4. **Start the bot:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

---

## Fine-Tuning Chadbot

You can customize Chadbot's personality and behavior to match your server's vibe:

1. **Prompts & Persona**:
   - Edit `server/ai/prompts.js` to tweak `PERSONA`, `VOICE`, and chat examples. You can change how witty, savage, chill, or desi the bot sounds.
2. **Offline Fallback Roasts**:
   - Edit `server/ai/fallbackRoasts.js` to add custom punchlines used when AI APIs are unreachable or rate-limited.
3. **Switch AI Models**:
   - In `.env`, change `GROQ_MODEL`, `GEMINI_MODEL`, or `PROVIDER_ORDER` to use any preferred LLM or fine-tuned model.
4. **Channel Presets**:
   - Use `/chadadmin preset` in Discord to switch channel vibes.

---

## How to Use Another Database

Chadbot uses **Prisma ORM**, which makes switching from SQLite to PostgreSQL, MySQL, or SQL Server straightforward:

1. **Update `prisma/schema.prisma`**:
   Change the datasource provider to your database:
   ```prisma
   datasource db {
     provider = "postgresql" // or "mysql"
   }
   ```
2. **Update `.env`**:
   Change `DATABASE_URL` to your database connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/chadbot?schema=public"
   ```
3. **Update Driver Adapter in `server/db/client.js`**:
   - For PostgreSQL: install `@prisma/adapter-pg` and `pg`, then replace the SQLite adapter with `PrismaPg`.
   - Or initialize Prisma directly without an adapter: `export const prisma = new PrismaClient();`
4. **Migrate**:
   Run the migration command to create tables:
   ```bash
   npm run db:migrate
   ```

---

<p align="center">
  <i>"If you think you are chad, remember there is chad-bot exits"</i>
</p>

---

Made by [Aditya Jha](https://github.com/adityajha-coder)
