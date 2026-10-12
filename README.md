# bonbast-cloudflare-worker

A Telegram bot that replies with currency and coin exchange rates in Toman (10 IRR) from [bonbast.com](https://bonbast.com), deployed on Cloudflare Workers.

## Requirements

- Node.js and npm
- A Cloudflare account
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

## Local development

Install dependencies and create a local `.dev.vars` file (this file is ignored by Git):

```sh
npm install
```

```dotenv
TELEGRAM_KEY=your-telegram-bot-token
USERS=telegram_username,another_username
TELEGRAM_WEBHOOK_SECRET=optional_random_secret
```

Then start the local Worker:

```sh
npm run dev
```

This starts the Worker locally, but Telegram cannot send webhooks directly to `localhost`. To test real Telegram updates locally, expose the local port through a secure tunnel and set the bot webhook to that public HTTPS URL, or deploy a separate test Worker.

Usernames are comma-separated without the `@` prefix. `TELEGRAM_WEBHOOK_SECRET` is optional, but if configured, webhook requests must include the matching secret header.

## Deploy

```sh
npm install
npx wrangler login
npx wrangler secret put TELEGRAM_KEY
npx wrangler secret put USERS
# Optional:
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
npm run deploy
```

Set production secrets with Wrangler; do not commit `.dev.vars` or put production secrets in it.

After deploying, configure Telegram's webhook using the URL shown by Wrangler:

```sh
curl "https://api.telegram.org/bot<TELEGRAM_KEY>/setWebhook" \
  --data-urlencode "url=https://<your-worker-subdomain>.workers.dev" \
  --data-urlencode "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

If you do not configure `TELEGRAM_WEBHOOK_SECRET`, omit the `secret_token` parameter.

## Commands

- `/start` — show the welcome message
- `/get` — fetch and display the current rates (restricted to usernames in `USERS`)

## Notes

- The Worker handles Telegram webhook updates via POST requests.
- Exchange rates are fetched live from Bonbast when an authorized user sends `/get`.
- Bonbast's HTML and request protocol are external dependencies and can change independently of this project.
