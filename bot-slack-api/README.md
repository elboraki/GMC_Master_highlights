# Slack Bot — Built with the Slack API (Bolt)

Exercise for **GMC Master** — building a Slack bot that responds to commands and logs messages via the Events API.

---

## Step 1 — Create a Slack App

1. Go to https://api.slack.com/apps and click **Create New App** → **From scratch**.
2. Name it (e.g. `gmc-bot`) and select your workspace.
3. Under **OAuth & Permissions**, add these **Bot Token Scopes**:
   - `chat:write` — send messages
   - `channels:history` — read channel messages
4. Under **Event Subscriptions** → **Subscribe to bot events**, add:
   - `message.channels` — listen to channel messages
5. Under **Socket Mode**, enable it and create an **App-Level Token** with scope `connections:write`.
6. Under **Slash Commands**, create:

   | Command | Description |
   |---------|-------------|
   | `/hello` | Responds with a greeting |

7. **Install the app** to your workspace from **OAuth & Permissions**.
8. Save the **Bot Token** (`xoxb-...`) and **Signing Secret** from **Basic Information**.

---

## Step 2 — Run the Bot Locally

```bash
# Install dependencies
npm install

# Fill in your credentials
cp .env.example .env
# Edit .env with your tokens

# Start the bot
npm start

# Or with auto-reload
npm run dev
```

---

## What the Bot Does

| Action | Behaviour |
|--------|-----------|
| `/hello [name]` | Greets the named user (or you, if blank) |
| Any message | Logs it to the console via the Events API |

---

## Resources

- [Slack API Docs](https://api.slack.com)
- [Bolt for JavaScript](https://slack.dev/bolt-js/tutorial/getting-started)
- [Events API Guide](https://api.slack.com/apis/connections/events-api)
