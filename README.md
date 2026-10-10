# bonbast-cloudflare-worker

A Telegram bot that replies with currency and coin exchange rates in Toman (10 IRR) from [bonbast.com](https://bonbast.com), deployed on Cloudflare Workers.

## Requirements

- Node.js and npm
- A Cloudflare account
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

## Local development

```sh
npm install
npx wrangler secret put TELEGRAM_KEY
npx wrangler secret put USERS
npm run dev
```

For local development, put secrets in a `.dev.vars` file (do not commit it):

```dotenv
TELEGRAM_KEY=your-telegram-bot-token
USERS=telegram_username,another_username
TELEGRAM_WEBHOOK_SECRET=optional_random_secret
```

Usernames are comma-separated without the `@` prefix. Configure these values as Worker secrets for production. `TELEGRAM_WEBHOOK_SECRET` is optional, but if configured, Telegram webhook requests must include the matching secret header.

## Deploy

```sh
npm install
npx wrangler login
npm run deploy
```

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
