import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const BASE_URL = "https://bonbast.com";

const headers = new Headers({
  "Host": "bonbast.com",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/116.0",
  "Accept": "application/json, text/javascript, */*; q=0.01",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  "X-Requested-With": "XMLHttpRequest",
  "Content-Length": "68",
  "Origin": "https://bonbast.com",
  "Connection": "keep-alive",
  "Referer": "https://bonbast.com/",
  "Cookie": "cookieconsent_status=true; st_bb=0",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "TE": "trailers",
});

const CURRENCIES = {
  "usd": "US Dollar",
  "eur": "Euro",
  "gbp": "British Pound",
  "chf": "Swiss Franc",
  "cad": "Canadian Dollar",
  "aud": "Australian Dollar",
  "sek": "Swedish Krona",
  "nok": "Norwegian Krone",
  "rub": "Russian Ruble",
  "thb": "Thai Baht",
  "sgd": "Singapore Dollar",
  "hkd": "Hong Kong Dollar",
  "azn": "Azerbaijani Manat",
  "amd": "10 Armenian Dram",
  "dkk": "Danish Krone",
  "aed": "UAE Dirham",
  "jpy": "10 Japanese Yen",
  "try": "Turkish Lira",
  "cny": "Chinese Yuan",
  "sar": "Saudi Riyal",
  "inr": "Indian Rupee",
  "myr": "Malaysian Ringgit",
  "afn": "Afghan Afghani",
  "kwd": "Kuwaiti Dinar",
  "iqd": "100 Iraqi Dinar",
  "bhd": "Bahraini Dinar",
  "omr": "Omani Rial",
  "qar": "Qatari Rial",
};

type CurrencyType = keyof typeof CURRENCIES;
const SELL = 1;
const BUY = 2;

async function getToken(): Promise<string | undefined> {
  try {
    const res = await fetch(BASE_URL, { headers });
    const html = await res.text();
    const document = new DOMParser().parseFromString(html, "text/html")
      ?.textContent;
    const extraction = document?.match(/param\s*[=:]\s*\"(.+)\"/);
    return extraction![1];
  } catch (error) {
    console.error(error);
  }
}

export async function getCurrencies(): Promise<string[][] | undefined> {
  try {
    const token = await getToken();
    if (token) {
      const body = `param=${token}`;
      const request = new Request(BASE_URL + "/json", {
        headers,
        method: "post",
        body,
      });
      await fetch(request).then((response) => {
        return response.json();
      }).then((data) => {
        const currencyList = [];

        for (const currency of Object.keys(CURRENCIES)) {
          const currentCurrency = [];
          currentCurrency.push(
            `buy ${CURRENCIES[currency as CurrencyType]} ${
              data[currency + BUY as CurrencyType]
            }`,
          );
          currentCurrency.push(
            `sell ${CURRENCIES[currency as CurrencyType]} ${
              data[currency + SELL as CurrencyType]
            }`,
          );
          currencyList.push(currentCurrency);
        }
        console.log(currencyList);
        return currencyList;
      });
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
