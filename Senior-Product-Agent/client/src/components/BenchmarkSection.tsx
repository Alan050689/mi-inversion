import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calculator, BarChart3 } from "lucide-react";
import { formatCurrencyUSD } from "@/lib/format";
import { daysBetween } from "@/lib/format";
import type { Transaction, BenchmarkInfo, BenchmarkIndexId } from "@shared/schema";

interface BenchmarkSectionProps {
  transactions: Transaction[];
  benchmarks: BenchmarkInfo[];
  selectedBenchmark: BenchmarkIndexId;
  onUpdateBenchmark: (id: BenchmarkIndexId) => void;
  isLoading: boolean;
  isUpdating: boolean;
}

export function BenchmarkSection({ 
  transactions, 
  benchmarks,
  selectedBenchmark,
  onUpdateBenchmark,
  isLoading,
  isUpdating
}: BenchmarkSectionProps) {
  const currentBenchmark = benchmarks.find(b => b.id === selectedBenchmark) || benchmarks[0];
  const benchmarkRate = currentBenchmark?.historicalRate || 10;

  const aportes = transactions.filter(t => t.type === "APORTE");
  
  const totalInvertidoUSD = aportes.reduce((sum, tx) => {
    if (tx.currency === "USD") {
      return sum + tx.amount;
    }
    return sum + (tx.usdEquivalent || 0);
  }, 0);

  const now = new Date();
  const valorHipotetico = aportes.reduce((sum, tx) => {
    const amountUSD = tx.currency === "USD" ? tx.amount : (tx.usdEquivalent || 0);
    const days = daysBetween(tx.date, now);
    const years = days / 365;
    const rate = benchmarkRate / 100;
    const compoundedValue = amountUSD * Math.pow(1 + rate, years);
    return sum + compoundedValue;
  }, 0);

  const diferencia = valorHipotetico - totalInvertidoUSD;
  const diferenciaPercent = totalInvertidoUSD > 0 
    ? ((diferencia / totalInvertidoUSD) * 100) 
    : 0;
  const isPositive = diferencia >= 0;

  const equityBenchmarks = benchmarks.filter(b => b.category === "equity");
  const realEstateBenchmarks = benchmarks.filter(b => b.category === "real_estate");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparación con Índices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="section-benchmark">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Comparación con Índices (Hipotético)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Índice de Referencia</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seleccioná el índice para comparar tu inversión
              </p>
            </div>
            <Select 
              value={selectedBenchmark} 
              onValueChange={(value) => onUpdateBenchmark(value as BenchmarkIndexId)}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full sm:w-[280px]" data-testid="select-benchmark">
                <SelectValue placeholder="Seleccionar índice" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Acciones
                </div>
                {equityBenchmarks.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex items-center gap-2">
                      <span>{b.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {b.historicalRate}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                  Inmobiliario
                </div>
                {realEstateBenchmarks.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex items-center gap-2">
                      <span>{b.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {b.historicalRate}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentBenchmark && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">
                {currentBenchmark.name}
              </Badge>
              <span className="text-muted-foreground">
                {currentBenchmark.description} - Rendimiento histórico: <strong>{currentBenchmark.historicalRate}% anual</strong>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-card border rounded-md">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Total Invertido</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-total-invested">
              {formatCurrencyUSD(totalInvertidoUSD)}
            </p>
          </div>

          <div className="p-4 bg-card border rounded-md">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calculator className="h-4 w-4" />
              <span className="text-sm font-medium">Valor {currentBenchmark?.name || "Índice"}</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-benchmark-value">
              {formatCurrencyUSD(valorHipotetico)}
            </p>
          </div>

          <div className={`p-4 rounded-md border ${
            isPositive 
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" 
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className="text-sm font-medium">Diferencia</span>
            </div>
            <p className={`text-2xl font-bold ${
              isPositive 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-red-600 dark:text-red-400"
            }`} data-testid="text-difference">
              {isPositive ? "+" : ""}{formatCurrencyUSD(diferencia)}
            </p>
            <p className={`text-sm ${
              isPositive 
                ? "text-emerald-600/80 dark:text-emerald-400/80" 
                : "text-red-600/80 dark:text-red-400/80"
            }`}>
              {isPositive ? "+" : ""}{diferenciaPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Cálculo basado en interés compuesto desde la fecha de cada aporte hasta hoy, usando tasa histórica de {currentBenchmark?.name || "índice seleccionado"}.
        </p>
      </CardContent>
    </Card>
  );
}
