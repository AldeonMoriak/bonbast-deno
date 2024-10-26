// import { serve } from "https://deno.land/std@0.198.0/http/server.ts";

console.log(`Function "telegram-bot" up and running!`);

import {
  Bot,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.17.2/mod.ts";
import {
  CoinListType,
  CurrencyListType,
  getCurrenciesAndCoins,
} from "./bonbast.ts";

const bot = new Bot(Deno.env.get("TELEGRAM_KEY") || "");

bot.command("start", (ctx) =>
  ctx.reply("Hello. get the latest currencies in Toman"),
);
bot.command("get", async (ctx) => {
  const user = await ctx.getAuthor();
  if (!Deno.env.get("USERS")!.split(",").includes(user.user.username!)) {
    console.log("*******", user.user.username, "*****", Deno.env.get("USERS"));
    return ctx.reply("Scram! You're not allowed to use this bot.");
  }
  try {
    const result = await getCurrenciesAndCoins();
    if (result?.currencyList && result?.coinList) {
      return ctx.reply(
        makeCurrencyTable(result.currencyList).concat(
          makeCoinTable(result.coinList),
        ),
        { parse_mode: "MarkdownV2" },
      );
    }
    return ctx.reply("Something went wrong!");
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    return ctx.reply(error.message);
  }
});

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  if (req.method === "POST") {
    return await handleUpdate(req);
    // const url = new URL(req.url);
    // console.log(url)
    // if (url.pathname.slice(1) === bot.token) {
    //   try {
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }
  }
  return new Response();
});

function rightpad(text: string, length: number): string {
  return text.concat(Array.from({ length: length - text.length }).join(" "));
}

function makeCurrencyTable(currencies: CurrencyListType[]): string {
  const data = currencies
    .map(
      (item) =>
        `| ${rightpad(item.currency, 20)} | ${rightpad(item.buy, 10)} | ${rightpad(
          item.sell,
          10,
        )} | \n`,
    )
    .join("");
  return (
    "```\n" +
    `| ${rightpad("Currency", 20)} | ${rightpad("Buy", 10)} | ${rightpad(
      "Sell",
      10,
    )} |\n| :------------------ | --------- | --------- |\n${data}\n`
      .replace(/\|/g, "\\|")
      .replace(/\-/g, "\\-") +
    "```"
  );
}

function makeCoinTable(coins: CoinListType[]): string {
  const data = coins
    .map(
      (item) =>
        `| ${rightpad(item.coin, 20)} | ${rightpad(item.buy, 15)} | ${rightpad(
          item.sell,
          15,
        )} | \n`,
    )
    .join("");
  return (
    "```\n" +
    `| ${rightpad("Coin", 20)} | ${rightpad("Buy", 15)} | ${rightpad(
      "Sell",
      15,
    )} |\n| :------------------ | -------------- | --------------- |\n${data}\n`
      .replace(/\|/g, "\\|")
      .replace(/\-/g, "\\-") +
    "```"
  );
}
