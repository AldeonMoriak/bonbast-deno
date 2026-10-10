import { Bot, webhookCallback } from "grammy";
import { getCurrenciesAndCoins, type CoinListType, type CurrencyListType } from "./bonbast";

interface Env {
  TELEGRAM_KEY: string;
  USERS: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
}

function createBot(env: Env): Bot {
  const bot = new Bot(env.TELEGRAM_KEY);

  bot.command("start", (ctx) =>
    ctx.reply("Hello. Get the latest currency exchange rates in Toman."),
  );

  bot.command("get", async (ctx) => {
    const username = ctx.from?.username;
    const allowedUsers = env.USERS.split(",").map((user) => user.trim()).filter(Boolean);

    if (!username || !allowedUsers.includes(username)) {
      console.warn("Rejected /get command", { username });
      return ctx.reply("Sorry, you're not allowed to use this bot.");
    }

    try {
      const result = await getCurrenciesAndCoins();

      if (!result?.currencyList || !result?.coinList) {
        return ctx.reply("Couldn't retrieve exchange rates. Please try again later.");
      }

      return ctx.reply(
        makeCurrencyTable(result.currencyList) + makeCoinTable(result.coinList),
        { parse_mode: "MarkdownV2" },
      );
    } catch (error) {
      console.error("Failed to get exchange rates", error);
      return ctx.reply("Something went wrong while retrieving exchange rates.");
    }
  });

  return bot;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Telegram webhook is ready.", { status: 200 });
    }

    if (env.TELEGRAM_WEBHOOK_SECRET) {
      const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (secret !== env.TELEGRAM_WEBHOOK_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    const bot = createBot(env);
    const handleUpdate = webhookCallback(bot, "cloudflare-mod");
    return handleUpdate(request);
  },
};

function rightpad(text: string, length: number): string {
  return text.concat(" ".repeat(Math.max(0, length - text.length)));
}

function makeCurrencyTable(currencies: CurrencyListType[]): string {
  const rows = currencies.map((item) =>
    `| ${rightpad(item.currency, 20)} | ${rightpad(item.buy, 10)} | ${rightpad(item.sell, 10)} |`
  );
  return [
    "```",
    `| ${rightpad("Currency", 20)} | ${rightpad("Buy", 10)} | ${rightpad("Sell", 10)} |`,
    "| :------------------ | ---------- | ---------- |",
    ...rows,
    "```",
  ].join("\n").replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1") + "\n";
}

function makeCoinTable(coins: CoinListType[]): string {
  const rows = coins.map((item) =>
    `| ${rightpad(item.coin, 8)} | ${rightpad(item.buy, 15)} | ${rightpad(item.sell, 15)} |`
  );
  return [
    "```",
    `| ${rightpad("Coin", 8)} | ${rightpad("Buy", 15)} | ${rightpad("Sell", 15)} |`,
    "| :-------- | --------------- | --------------- |",
    ...rows,
    "```",
  ].join("\n").replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}
