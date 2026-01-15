import express, { type Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

interface Transaction {
  id: string;
  date: string;
  type: "APORTE" | "COBRO";
  currency: "USD" | "ARS";
  amount: number;
  fxType?: string;
  fxRate?: number;
  usdEquivalent?: number;
  note?: string;
}

interface Settings {
  benchmarkRate: number;
  selectedBenchmark: string;
}

interface FxRates {
  blue: number;
  oficial: number;
  mep: number;
  ccl: number;
  tarjeta: number;
  mayorista: number;
  timestamp: string;
}

const data = {
  transactions: [] as Transaction[],
  settings: { benchmarkRate: 10, selectedBenchmark: "sp500" } as Settings,
};

const BENCHMARK_INDICES = [
  { id: "sp500", name: "S&P 500", historicalRate: 10.5, description: "500 empresas más grandes de EE.UU.", category: "equity" },
  { id: "nasdaq100", name: "Nasdaq 100", historicalRate: 14.5, description: "100 empresas tecnológicas", category: "equity" },
  { id: "dowjones", name: "Dow Jones", historicalRate: 8.0, description: "30 empresas industriales", category: "equity" },
  { id: "russell2000", name: "Russell 2000", historicalRate: 9.0, description: "2000 empresas pequeñas", category: "equity" },
  { id: "msci_realestate", name: "MSCI Real Estate", historicalRate: 7.5, description: "Índice inmobiliario global", category: "real_estate" },
  { id: "ftse_nareit", name: "FTSE NAREIT", historicalRate: 9.5, description: "REITs de EE.UU.", category: "real_estate" },
  { id: "msci_world", name: "MSCI World", historicalRate: 8.5, description: "Acciones de países desarrollados", category: "equity" },
  { id: "msci_em", name: "MSCI Emerging Markets", historicalRate: 7.0, description: "Mercados emergentes", category: "equity" },
];

let fxCache: { rates: FxRates; timestamp: number } | null = null;

async function getFxRates(): Promise<FxRates> {
  const defaultRates: FxRates = {
    blue: 1200, oficial: 1000, mep: 1180, ccl: 1190, tarjeta: 1300, mayorista: 990,
    timestamp: new Date().toISOString(),
  };
  if (fxCache && Date.now() - fxCache.timestamp < 300000) return fxCache.rates;
  try {
    const response = await fetch("https://dolarapi.com/v1/dolares", { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return defaultRates;
    const apiData = await response.json();
    const rates = { ...defaultRates };
    for (const item of apiData) {
      const casa = item.casa?.toLowerCase();
      if (casa === "blue") rates.blue = item.venta || defaultRates.blue;
      else if (casa === "oficial") rates.oficial = item.venta || defaultRates.oficial;
      else if (casa === "bolsa" || casa === "mep") rates.mep = item.venta || defaultRates.mep;
      else if (casa === "contadoconliqui" || casa === "ccl") rates.ccl = item.venta || defaultRates.ccl;
      else if (casa === "tarjeta") rates.tarjeta = item.venta || defaultRates.tarjeta;
      else if (casa === "mayorista") rates.mayorista = item.venta || defaultRates.mayorista;
    }
    rates.timestamp = new Date().toISOString();
    fxCache = { rates, timestamp: Date.now() };
    return rates;
  } catch { return defaultRates; }
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

app.get("/api/status", (_req, res) => res.json({ demoMode: true, storageType: "memory (Vercel)" }));
app.get("/api/transactions", (_req, res) => res.json(data.transactions));
app.get("/api/transactions/:id", (req, res) => {
  const tx = data.transactions.find(t => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: "Movimiento no encontrado" });
  res.json(tx);
});
app.post("/api/transactions", (req, res) => {
  const { date, type, currency, amount, fxType, fxRate, note } = req.body;
  const usdEquivalent = currency === "ARS" && fxRate ? amount / fxRate : undefined;
  const tx: Transaction = { id: generateId(), date, type, currency, amount, fxType, fxRate, usdEquivalent, note };
  data.transactions.push(tx);
  data.transactions.sort((a, b) => b.date.localeCompare(a.date));
  res.status(201).json(tx);
});
app.put("/api/transactions/:id", (req, res) => {
  const idx = data.transactions.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Movimiento no encontrado" });
  const { date, type, currency, amount, fxType, fxRate, note } = req.body;
  const usdEquivalent = currency === "ARS" && fxRate ? amount / fxRate : undefined;
  data.transactions[idx] = { ...data.transactions[idx], date, type, currency, amount, fxType, fxRate, usdEquivalent, note };
  data.transactions.sort((a, b) => b.date.localeCompare(a.date));
  res.json(data.transactions[idx]);
});
app.delete("/api/transactions/:id", (req, res) => {
  const idx = data.transactions.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Movimiento no encontrado" });
  data.transactions.splice(idx, 1);
  res.status(204).send();
});
app.get("/api/fx-rates", async (_req, res) => res.json(await getFxRates()));
app.get("/api/benchmarks", (_req, res) => res.json(BENCHMARK_INDICES));
app.get("/api/settings", (_req, res) => res.json(data.settings));
app.put("/api/settings", (req, res) => { data.settings = { ...data.settings, ...req.body }; res.json(data.settings); });
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => { console.error("Error:", err); res.status(500).json({ error: "Error interno" }); });

export default app;
