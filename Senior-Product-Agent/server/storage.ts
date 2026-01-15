import { type Transaction, type Settings, type AppData, type InsertTransaction } from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface IStorage {
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(data: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, data: InsertTransaction): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
  isDemoMode(): boolean;
  getStorageType(): string;
}

const DEFAULT_DATA: AppData = {
  transactions: [],
  settings: {
    benchmarkRate: 10,
    selectedBenchmark: "sp500",
  },
};

export class MemStorage implements IStorage {
  private data: AppData;

  constructor() {
    this.data = { ...DEFAULT_DATA, transactions: [], settings: { ...DEFAULT_DATA.settings } };
  }

  async getTransactions(): Promise<Transaction[]> {
    return [...this.data.transactions];
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.data.transactions.find(t => t.id === id);
  }

  async createTransaction(insertData: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...insertData,
      id: randomUUID(),
      usdEquivalent: this.calculateUsdEquivalent(insertData),
    };
    this.data.transactions.push(transaction);
    return transaction;
  }

  async updateTransaction(id: string, insertData: InsertTransaction): Promise<Transaction | undefined> {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    const updated: Transaction = {
      ...insertData,
      id,
      usdEquivalent: this.calculateUsdEquivalent(insertData),
    };
    this.data.transactions[index] = updated;
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.data.transactions.splice(index, 1);
    return true;
  }

  async getSettings(): Promise<Settings> {
    return { ...this.data.settings };
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    this.data.settings = { ...this.data.settings, ...settings };
    return { ...this.data.settings };
  }

  isDemoMode(): boolean {
    return true;
  }

  getStorageType(): string {
    return "memory";
  }

  private calculateUsdEquivalent(data: InsertTransaction): number | undefined {
    if (data.currency === "ARS" && data.fxRate && data.fxRate > 0) {
      return data.amount / data.fxRate;
    }
    return undefined;
  }
}

export class FileStorage implements IStorage {
  private filePath: string;
  private data: AppData;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.data = this.loadData();
  }

  private loadData(): AppData {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(content);
        return {
          transactions: parsed.transactions || [],
          settings: { 
            benchmarkRate: parsed.settings?.benchmarkRate ?? 10,
            selectedBenchmark: parsed.settings?.selectedBenchmark ?? "sp500",
          },
        };
      }
    } catch (error) {
      console.error('Error loading data file:', error);
    }
    return { ...DEFAULT_DATA, transactions: [], settings: { ...DEFAULT_DATA.settings } };
  }

  private saveData(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving data file:', error);
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    return [...this.data.transactions];
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.data.transactions.find(t => t.id === id);
  }

  async createTransaction(insertData: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...insertData,
      id: randomUUID(),
      usdEquivalent: this.calculateUsdEquivalent(insertData),
    };
    this.data.transactions.push(transaction);
    this.saveData();
    return transaction;
  }

  async updateTransaction(id: string, insertData: InsertTransaction): Promise<Transaction | undefined> {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    const updated: Transaction = {
      ...insertData,
      id,
      usdEquivalent: this.calculateUsdEquivalent(insertData),
    };
    this.data.transactions[index] = updated;
    this.saveData();
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.data.transactions.splice(index, 1);
    this.saveData();
    return true;
  }

  async getSettings(): Promise<Settings> {
    return { ...this.data.settings };
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
    return { ...this.data.settings };
  }

  isDemoMode(): boolean {
    return false;
  }

  getStorageType(): string {
    return "file";
  }

  private calculateUsdEquivalent(data: InsertTransaction): number | undefined {
    if (data.currency === "ARS" && data.fxRate && data.fxRate > 0) {
      return data.amount / data.fxRate;
    }
    return undefined;
  }
}

function createStorage(): IStorage {
  const possiblePaths = [
    './data/data.json',
    '/tmp/data.json',
  ];

  for (const filePath of possiblePaths) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const testFile = path.join(dir, '.write-test');
      fs.writeFileSync(testFile, 'test', 'utf-8');
      fs.unlinkSync(testFile);
      
      console.log(`Using file storage at: ${filePath}`);
      return new FileStorage(filePath);
    } catch (error) {
      console.log(`Cannot write to ${filePath}, trying next...`);
    }
  }

  console.log('Using in-memory storage (demo mode)');
  return new MemStorage();
}

export const storage = createStorage();
