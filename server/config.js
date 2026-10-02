import 'dotenv/config';
import { z } from 'zod';

const schema = z
  .object({
    DISCORD_TOKEN: z.string().min(30, 'DISCORD_TOKEN is missing or too short'),
    DISCORD_CLIENT_ID: z.string().min(5),
    DISCORD_GUILD_ID: z.string().optional(),
    LOG_CHANNEL_ID: z.string().optional(),
    OWNER_ID: z.string().optional(),
    DATABASE_URL: z.string().default('file:./data/chadbot.db'),

    PROVIDER_ORDER: z.string().default('groq,gemini,openrouter'),
    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
    GROQ_FAST_MODEL: z.string().default('llama-3.1-8b-instant'),
    GROQ_DAILY_LIMIT: z.coerce.number().default(800),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
    GEMINI_FAST_MODEL: z.string().default('gemini-3.1-flash-lite'),
    GEMINI_DAILY_LIMIT: z.coerce.number().default(400),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL: z.string().default('meta-llama/llama-3.3-70b-instruct:free'),
    OPENROUTER_DAILY_LIMIT: z.coerce.number().default(40),

    KLIPY_API_KEY: z.string().optional(),
    GIPHY_API_KEY: z.string().optional(),
    GIF_ORDER: z.string().default('klipy,giphy'),
    GIF_CHANCE: z.coerce.number().min(0).max(1).default(0.7),
    GIF_DAILY_CAP: z.coerce.number().default(150),

    DEFAULT_SPICE: z.coerce.number().int().min(1).max(4).default(3),
    AUTO_ROAST_CHANCE: z.coerce.number().min(0).max(1).default(0.05),
    AUTO_CHANNEL_COOLDOWN_MIN: z.coerce.number().default(10),
    AUTO_USER_COOLDOWN_MIN: z.coerce.number().default(30),
    AUTO_ROAST_DAILY_CAP: z.coerce.number().default(120),
    USER_DAILY_CAP: z.coerce.number().default(40),

    REACTION_CHANCE: z.coerce.number().min(0).max(1).default(0.03),
    REACTION_COOLDOWN_SEC: z.coerce.number().default(20),
    REACTION_DAILY_CAP: z.coerce.number().default(400),

    REVIVE_AFTER_HOURS: z.coerce.number().default(12),
    REVIVE_CHECK_MIN: z.coerce.number().default(10),
    REVIVE_QUIET_HOURS: z.string().optional(), 
    TIMEZONE: z.string().default('Asia/Kolkata'),

    REPLY_CHAIN_MAX: z.coerce.number().default(6),
    REPLY_BOT_TURN_CAP: z.coerce.number().default(6),
  })
  .refine((c) => c.GROQ_API_KEY || c.GEMINI_API_KEY || c.OPENROUTER_API_KEY, {
    message: 'Set at least one AI API key',
  });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('!! Invalid .env configuration:');
  for (const i of parsed.error.issues) console.error(` - ${i.path.join('.') || '(general)'}: ${i.message}`);
  process.exit(1);
}
export const config = parsed.data;
