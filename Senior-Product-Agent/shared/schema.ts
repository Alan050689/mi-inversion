import { z } from "zod";

export const transactionTypeSchema = z.enum(["APORTE", "COBRO"]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const currencySchema = z.enum(["USD", "ARS"]);
export type Currency = z.infer<typeof currencySchema>;

export const fxTypeSchema = z.enum(["BLUE", "OFICIAL", "MEP", "CCL", "TARJETA", "MAYORISTA", "MANUAL"]);
export type FxType = z.infer<typeof fxTypeSchema>;

export const transactionSchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: transactionTypeSchema,
  currency: currencySchema,
  amount: z.number().positive(),
  note: z.string().optional(),
  fxType: fxTypeSchema.optional(),
  fxRate: z.number().positive().optional(),
  usdEquivalent: z.number().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const insertTransactionSchema = transactionSchema.omit({ id: true, usdEquivalent: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export const benchmarkIndexSchema = z.enum([
  "sp500",
  "nasdaq100", 
  "dowjones",
  "russell2000",
  "msci_real_estate",
  "ftse_nareit",
  "msci_world",
  "msci_emerging"
]);
export type BenchmarkIndexId = z.infer<typeof benchmarkIndexSchema>;

export const settingsSchema = z.object({
  benchmarkRate: z.number().min(0).max(100).default(10),
  selectedBenchmark: benchmarkIndexSchema.default("sp500"),
});

export type Settings = z.infer<typeof settingsSchema>;

export const appDataSchema = z.object({
  transactions: z.array(transactionSchema),
  settings: settingsSchema,
});

export type AppData = z.infer<typeof appDataSchema>;

export const fxRatesSchema = z.object({
  blue: z.number().positive(),
  oficial: z.number().positive(),
  mep: z.number().positive(),
  ccl: z.number().positive(),
  tarjeta: z.number().positive(),
  mayorista: z.number().positive(),
  timestamp: z.string(),
});

export type FxRates = z.infer<typeof fxRatesSchema>;

export const benchmarkInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  historicalRate: z.number(),
  category: z.enum(["equity", "real_estate", "mixed"]),
});

export type BenchmarkInfo = z.infer<typeof benchmarkInfoSchema>;
