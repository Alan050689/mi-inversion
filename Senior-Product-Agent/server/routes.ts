import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getFxRates } from "./fx";
import { BENCHMARK_INDICES } from "./benchmarks";
import { insertTransactionSchema, settingsSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/status", async (_req, res) => {
    res.json({
      demoMode: storage.isDemoMode(),
      storageType: storage.getStorageType(),
    });
  });

  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ error: "Error al obtener movimientos" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error getting transaction:", error);
      res.status(500).json({ error: "Error al obtener movimiento" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const parsed = insertTransactionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: parsed.error.errors 
        });
      }

      const transaction = await storage.createTransaction(parsed.data);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Error al crear movimiento" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const parsed = insertTransactionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: parsed.error.errors 
        });
      }

      const transaction = await storage.updateTransaction(req.params.id, parsed.data);
      if (!transaction) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Error al actualizar movimiento" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Error al eliminar movimiento" });
    }
  });

  app.get("/api/fx-rates", async (_req, res) => {
    try {
      const rates = await getFxRates();
      res.json(rates);
    } catch (error) {
      console.error("Error getting FX rates:", error);
      res.status(500).json({ error: "Error al obtener tipo de cambio" });
    }
  });

  app.get("/api/benchmarks", async (_req, res) => {
    res.json(BENCHMARK_INDICES);
  });

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error getting settings:", error);
      res.status(500).json({ error: "Error al obtener configuración" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const parsed = settingsSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: parsed.error.errors 
        });
      }

      const settings = await storage.updateSettings(parsed.data);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Error al actualizar configuración" });
    }
  });

  return httpServer;
}
