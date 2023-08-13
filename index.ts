// import { serve } from "https://deno.land/std@0.198.0/http/server.ts";

console.log(`Function "telegram-bot" up and running!`);

import {
  Bot,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.17.2/mod.ts";
import { getCurrencies } from "./bonbast.ts";

const bot = new Bot(Deno.env.get("TELEGRAM_KEY") || "");

bot.command(
  "start",
  (ctx) => ctx.reply("Hello. get the latest currencies in Toman"),
);
bot.command("get", async (ctx) => {
  const user = await ctx.getAuthor();
  if (
    !Deno.env.get("USERS")!.split(",").includes(
      user.user.username!.toLowerCase(),
    )
  ) {
    console.log("*******", user.user.username, "*****", Deno.env.get("USERS"));
    return ctx.reply("Scram! You're not allowed to use this bot.");
  }
  try {
    const currencies = await getCurrencies();
    if (currencies) {
      let text = "";
      for (const currency in currencies) {
        text += currency[0] + currency[1] + "\n";
      }
      return ctx.reply(text);
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
