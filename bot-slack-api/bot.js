require('dotenv/config');
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !!process.env.SLACK_APP_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
});

// ── Commands ──────────────────────────────────────────────

app.command('/hello', async ({ command, ack, say }) => {
  await ack();
  const name = command.text.trim() || command.user_name;
  await say(`Hello, <@${name}>! 👋`);
});

// ── Events ────────────────────────────────────────────────

// Log every message in channels the bot belongs to
app.message(async ({ message, say }) => {
  console.log(`[${new Date().toISOString()}] "${message.text}"`);
});

// ── Start ─────────────────────────────────────────────────

(async () => {
  const port = Number(process.env.PORT) || 3000;
  await app.start(port);
  console.log(`⚡ Slack bot is running on port ${port}`);
})();
