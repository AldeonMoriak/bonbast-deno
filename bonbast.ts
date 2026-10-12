const BASE_URL = "https://bonbast.com";

const headers = new Headers({
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
  Accept: "application/json, text/javascript, */*; q=0.01",
  "Accept-Language": "en-US,en;q=0.5",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  "X-Requested-With": "XMLHttpRequest",
  Origin: BASE_URL,
  Referer: `${BASE_URL}/`,
  Cookie: "cookieconsent_status=true; st_bb=0",
});

const CURRENCIES = {
  usd: "US Dollar", eur: "Euro", gbp: "British Pound", chf: "Swiss Franc",
  cad: "Canadian Dollar", aud: "Australian Dollar", sek: "Swedish Krona",
  nok: "Norwegian Krone", rub: "Russian Ruble", thb: "Thai Baht",
  sgd: "Singapore Dollar", hkd: "Hong Kong Dollar", azn: "Azerbaijani Manat",
  amd: "10 Armenian Dram", dkk: "Danish Krone", aed: "UAE Dirham",
  jpy: "10 Japanese Yen", try: "Turkish Lira", cny: "Chinese Yuan",
  sar: "Saudi Riyal", inr: "Indian Rupee", myr: "Malaysian Ringgit",
  afn: "Afghan Afghani", kwd: "Kuwaiti Dinar", iqd: "100 Iraqi Dinar",
  bhd: "Bahraini Dinar", omr: "Omani Rial", qar: "Qatari Rial",
} as const;

const COINS = {
  azadi1: "Azadi", emami1: "Emami", azadi1_2: "½ Azadi",
  azadi1_4: "¼ Azadi", azadi1g: "Gerami",
} as const;

type CurrencyType = keyof typeof CURRENCIES;
type CoinType = keyof typeof COINS;
const SELL = 1;
const BUY = 2;

export type CurrencyListType = {
  currency: (typeof CURRENCIES)[CurrencyType];
  buy: string;
  sell: string;
};

export type CoinListType = {
  coin: (typeof COINS)[CoinType];
  buy: string;
  sell: string;
};

async function getToken(): Promise<string | undefined> {
  const response = await fetch(BASE_URL, { headers });
  if (!response.ok) {
    throw new Error(`Bonbast page request failed: HTTP ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/param\s*[=:]\s*["']([^"']+)["']/i);
  return match?.[1];
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    throw new Error("Bonbast response is missing an expected rate.");
  }
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new Error("Bonbast response contains an invalid rate.");
  }
  return numericValue.toLocaleString("en-US");
}

export async function getCurrenciesAndCoins(): Promise<
  { currencyList: CurrencyListType[]; coinList: CoinListType[] } | undefined
> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Couldn't find the Bonbast request token.");
    }

    const response = await fetch(`${BASE_URL}/json`, {
      method: "POST",
      headers,
      body: new URLSearchParams({ param: token }),
    });
    if (!response.ok) {
      throw new Error(`Bonbast rates request failed: HTTP ${response.status}`);
    }

    const data = await response.json() as Record<string, string | number>;
    const currencyList = Object.entries(CURRENCIES).map(([key, currency]) => ({
      currency,
      buy: formatValue(data[`${key}${BUY}`]),
      sell: formatValue(data[`${key}${SELL}`]),
    }));

    const coinList = Object.entries(COINS).map(([key, coin]) => ({
      coin,
      buy: formatValue(data[`${key}${BUY}`]),
      sell: formatValue(data[key]),
    }));

    return { currencyList, coinList };
  } catch (error) {
    console.error("Failed to retrieve Bonbast rates", error);
    return undefined;
  }
}
