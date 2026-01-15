export interface BenchmarkIndex {
  id: string;
  name: string;
  description: string;
  historicalRate: number;
  category: "equity" | "real_estate" | "mixed";
}

export const BENCHMARK_INDICES: BenchmarkIndex[] = [
  {
    id: "sp500",
    name: "S&P 500",
    description: "500 empresas más grandes de EE.UU.",
    historicalRate: 10,
    category: "equity",
  },
  {
    id: "nasdaq100",
    name: "Nasdaq 100",
    description: "100 empresas tech más grandes",
    historicalRate: 12,
    category: "equity",
  },
  {
    id: "dowjones",
    name: "Dow Jones",
    description: "30 empresas blue-chip de EE.UU.",
    historicalRate: 8,
    category: "equity",
  },
  {
    id: "russell2000",
    name: "Russell 2000",
    description: "2,000 empresas pequeñas de EE.UU.",
    historicalRate: 9,
    category: "equity",
  },
  {
    id: "msci_real_estate",
    name: "MSCI US Real Estate",
    description: "REITs inmobiliarios de EE.UU.",
    historicalRate: 7,
    category: "real_estate",
  },
  {
    id: "ftse_nareit",
    name: "FTSE NAREIT",
    description: "Índice de REITs americanos",
    historicalRate: 7.5,
    category: "real_estate",
  },
  {
    id: "msci_world",
    name: "MSCI World",
    description: "Mercados desarrollados globales",
    historicalRate: 8.5,
    category: "equity",
  },
  {
    id: "msci_emerging",
    name: "MSCI Emerging Markets",
    description: "Mercados emergentes (China, Brasil, India)",
    historicalRate: 9.5,
    category: "equity",
  },
];

export function getBenchmarkById(id: string): BenchmarkIndex | undefined {
  return BENCHMARK_INDICES.find(b => b.id === id);
}

export function getBenchmarksByCategory(category: BenchmarkIndex["category"]): BenchmarkIndex[] {
  return BENCHMARK_INDICES.filter(b => b.category === category);
}
