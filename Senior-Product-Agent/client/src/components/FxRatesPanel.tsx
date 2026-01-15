import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { FxRates } from "@shared/schema";

interface FxRatesPanelProps {
  fxRates?: FxRates;
  isLoading: boolean;
}

const FX_LABELS: Record<keyof Omit<FxRates, "timestamp">, { name: string; description: string }> = {
  blue: { name: "Blue", description: "Mercado informal" },
  oficial: { name: "Oficial", description: "Banco Nación" },
  mep: { name: "MEP", description: "Bolsa (Dólar Bolsa)" },
  ccl: { name: "CCL", description: "Contado con Liquidación" },
  tarjeta: { name: "Tarjeta", description: "Compras internacionales" },
  mayorista: { name: "Mayorista", description: "Comercio exterior" },
};

export function FxRatesPanel({ fxRates, isLoading }: FxRatesPanelProps) {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "-";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cotizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fxRates) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cotizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No se pudieron cargar las cotizaciones
          </p>
        </CardContent>
      </Card>
    );
  }

  const rates = Object.entries(FX_LABELS).map(([key, label]) => ({
    key,
    ...label,
    value: fxRates[key as keyof typeof FX_LABELS] as number,
  }));

  return (
    <Card data-testid="panel-fxrates">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cotizaciones en Vivo
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(fxRates.timestamp)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rates.map((rate) => (
            <div 
              key={rate.key}
              className="p-3 rounded-md border bg-card hover-elevate"
              data-testid={`fxrate-${rate.key}`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-xs">
                  {rate.name}
                </Badge>
                {rate.key === "blue" && (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                )}
              </div>
              <p className="text-lg font-bold font-mono">
                $ {formatNumber(rate.value, 0)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {rate.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
