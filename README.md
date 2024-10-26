# bonbast-deno
A Telegram bot of Currency exchange rate list for Toman (10th of IRR) from bonbast.com

# Usage
1. Fork this repository.
2. Make an account in [deno land](https://deno.land/).
3. Add USERS as a string separated by ',' without any spaces, e.g. 'test,second_test' and TELEGRAM_KEY to the environment variables in deno deploy settings.
4. Select the forked repository and `index.ts` file after that.
5. Send a request to this url to configure your bot's webhook to point to your app: `https://api.telegram.org/bot<token>/setWebhook?url=<url>`
