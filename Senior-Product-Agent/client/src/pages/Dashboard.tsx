import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DemoBanner } from "@/components/DemoBanner";
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { BenchmarkSection } from "@/components/BenchmarkSection";
import { FxRatesPanel } from "@/components/FxRatesPanel";
import { DollarSign, Banknote, Building2 } from "lucide-react";
import { formatCurrencyUSD, formatCurrencyARS } from "@/lib/format";
import type { Transaction, FxRates, Settings, BenchmarkInfo, BenchmarkIndexId, FxType } from "@shared/schema";

interface AppStatus {
  demoMode: boolean;
  storageType: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: status } = useQuery<AppStatus>({
    queryKey: ['/api/status'],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const { data: fxRates, isLoading: fxRatesLoading } = useQuery<FxRates>({
    queryKey: ['/api/fx-rates'],
  });

  const { data: benchmarks = [], isLoading: benchmarksLoading } = useQuery<BenchmarkInfo[]>({
    queryKey: ['/api/benchmarks'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      date: string;
      type: "APORTE" | "COBRO";
      currency: "USD" | "ARS";
      amount: number;
      note?: string;
      fxType?: FxType;
      fxRate?: number;
    }) => {
      const response = await apiRequest('POST', '/api/transactions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Movimiento agregado",
        description: "El movimiento se guardó correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el movimiento.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: {
      date: string;
      type: "APORTE" | "COBRO";
      currency: "USD" | "ARS";
      amount: number;
      note?: string;
      fxType?: FxType;
      fxRate?: number;
    }}) => {
      const response = await apiRequest('PUT', `/api/transactions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setEditingTransaction(null);
      toast({
        title: "Movimiento actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el movimiento.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await apiRequest('DELETE', `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Movimiento eliminado",
        description: "El movimiento se eliminó correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el movimiento.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const response = await apiRequest('PUT', '/api/settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configuración actualizada",
        description: "Los cambios se guardaron correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: {
    date: string;
    type: "APORTE" | "COBRO";
    currency: "USD" | "ARS";
    amount: number;
    note?: string;
    fxType?: FxType;
    fxRate?: number;
  }) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleUpdateBenchmark = (benchmarkId: BenchmarkIndexId) => {
    const benchmark = benchmarks.find(b => b.id === benchmarkId);
    if (benchmark) {
      updateSettingsMutation.mutate({ 
        selectedBenchmark: benchmarkId,
        benchmarkRate: benchmark.historicalRate 
      });
    }
  };

  const aportes = transactions.filter(t => t.type === "APORTE");
  const totalUSD = aportes
    .filter(t => t.currency === "USD")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalARS = aportes
    .filter(t => t.currency === "ARS")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEquivalentUSD = aportes.reduce((sum, t) => {
    if (t.currency === "USD") return sum + t.amount;
    return sum + (t.usdEquivalent || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner visible={status?.demoMode || false} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary rounded-md">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
              Mi Inversión
            </h1>
          </div>
          <p className="text-muted-foreground">
            Seguimiento de aportes a proyecto inmobiliario
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard
            title="Total USD Aportado"
            value={formatCurrencyUSD(totalUSD)}
            subtitle={`${aportes.filter(t => t.currency === "USD").length} aportes`}
            icon={DollarSign}
            isLoading={transactionsLoading}
            testId="card-total-usd"
          />
          <SummaryCard
            title="Total ARS Aportado"
            value={formatCurrencyARS(totalARS)}
            subtitle={`${aportes.filter(t => t.currency === "ARS").length} aportes`}
            icon={Banknote}
            isLoading={transactionsLoading}
            testId="card-total-ars"
          />
          <SummaryCard
            title="Total en USD"
            value={formatCurrencyUSD(totalEquivalentUSD)}
            subtitle="Equivalente total"
            icon={DollarSign}
            isLoading={transactionsLoading}
            testId="card-total-equivalent"
          />
        </div>

        <div className="mb-8">
          <FxRatesPanel fxRates={fxRates} isLoading={fxRatesLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <TransactionForm
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              fxRates={fxRates}
              fxRatesLoading={fxRatesLoading}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />
          </div>
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              isLoading={transactionsLoading}
              onEdit={setEditingTransaction}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deletingId}
            />
          </div>
        </div>

        <BenchmarkSection
          transactions={transactions}
          benchmarks={benchmarks}
          selectedBenchmark={settings?.selectedBenchmark || "sp500"}
          onUpdateBenchmark={handleUpdateBenchmark}
          isLoading={settingsLoading || benchmarksLoading}
          isUpdating={updateSettingsMutation.isPending}
        />

        <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            MVP - Seguimiento de Inversión Inmobiliaria
            {status?.storageType && ` | Storage: ${status.storageType}`}
          </p>
        </footer>
      </div>
    </div>
  );
}
