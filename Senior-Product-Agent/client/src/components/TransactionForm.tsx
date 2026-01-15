import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Save } from "lucide-react";
import { getTodayDate, formatNumber } from "@/lib/format";
import type { FxRates, Transaction, FxType } from "@shared/schema";

const FX_OPTIONS: { value: FxType; label: string }[] = [
  { value: "BLUE", label: "Dólar Blue" },
  { value: "OFICIAL", label: "Dólar Oficial" },
  { value: "MEP", label: "Dólar MEP" },
  { value: "CCL", label: "Dólar CCL" },
  { value: "TARJETA", label: "Dólar Tarjeta" },
  { value: "MAYORISTA", label: "Dólar Mayorista" },
  { value: "MANUAL", label: "Manual" },
];

const formSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  type: z.enum(["APORTE", "COBRO"]),
  currency: z.enum(["USD", "ARS"]),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Monto debe ser mayor a 0"),
  note: z.string().optional(),
  fxType: z.enum(["BLUE", "OFICIAL", "MEP", "CCL", "TARJETA", "MAYORISTA", "MANUAL"]).optional(),
  fxRate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSubmit: (data: {
    date: string;
    type: "APORTE" | "COBRO";
    currency: "USD" | "ARS";
    amount: number;
    note?: string;
    fxType?: FxType;
    fxRate?: number;
  }) => void;
  isSubmitting: boolean;
  fxRates?: FxRates;
  fxRatesLoading?: boolean;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

export function TransactionForm({ 
  onSubmit, 
  isSubmitting, 
  fxRates,
  fxRatesLoading,
  editingTransaction,
  onCancelEdit
}: TransactionFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: editingTransaction?.date || getTodayDate(),
      type: editingTransaction?.type || "APORTE",
      currency: editingTransaction?.currency || "USD",
      amount: editingTransaction?.amount?.toString() || "",
      note: editingTransaction?.note || "",
      fxType: editingTransaction?.fxType || "BLUE",
      fxRate: editingTransaction?.fxRate?.toString() || "",
    },
  });

  const currency = form.watch("currency");
  const fxType = form.watch("fxType");

  useEffect(() => {
    if (editingTransaction) {
      form.reset({
        date: editingTransaction.date,
        type: editingTransaction.type,
        currency: editingTransaction.currency,
        amount: editingTransaction.amount.toString(),
        note: editingTransaction.note || "",
        fxType: editingTransaction.fxType || "BLUE",
        fxRate: editingTransaction.fxRate?.toString() || "",
      });
    } else {
      form.reset({
        date: getTodayDate(),
        type: "APORTE",
        currency: "USD",
        amount: "",
        note: "",
        fxType: "BLUE",
        fxRate: "",
      });
    }
  }, [editingTransaction, form]);

  const getFxRateForType = (type: FxType | undefined): number | undefined => {
    if (!fxRates || !type) return undefined;
    const mapping: Record<string, keyof FxRates> = {
      BLUE: "blue",
      OFICIAL: "oficial",
      MEP: "mep",
      CCL: "ccl",
      TARJETA: "tarjeta",
      MAYORISTA: "mayorista",
    };
    const key = mapping[type];
    if (key && key !== "timestamp") {
      return fxRates[key] as number;
    }
    return undefined;
  };

  const handleSubmit = (data: FormData) => {
    let fxRateValue: number | undefined;
    
    if (data.currency === "ARS") {
      if (data.fxType === "MANUAL" && data.fxRate) {
        fxRateValue = Number(data.fxRate);
      } else {
        fxRateValue = getFxRateForType(data.fxType as FxType);
      }
    }

    onSubmit({
      date: data.date,
      type: data.type,
      currency: data.currency,
      amount: Number(data.amount),
      note: data.note || undefined,
      fxType: data.currency === "ARS" ? (data.fxType as FxType) : undefined,
      fxRate: fxRateValue,
    });

    if (!editingTransaction) {
      form.reset({
        date: getTodayDate(),
        type: "APORTE",
        currency: "USD",
        amount: "",
        note: "",
        fxType: "BLUE",
        fxRate: "",
      });
    }
  };

  const getFxRateDisplay = () => {
    if (fxRatesLoading) return "Cargando...";
    const rate = getFxRateForType(fxType as FxType);
    if (rate) return `$ ${formatNumber(rate, 0)}`;
    return "No disponible";
  };

  const calculateUsdEquivalent = () => {
    const amount = Number(form.watch("amount"));
    if (isNaN(amount) || amount <= 0) return null;
    
    let rate: number | undefined;
    if (fxType === "MANUAL") {
      rate = Number(form.watch("fxRate"));
    } else {
      rate = getFxRateForType(fxType as FxType);
    }
    
    if (!rate || rate <= 0) return null;
    return amount / rate;
  };

  const usdEquiv = currency === "ARS" ? calculateUsdEquivalent() : null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">
          {editingTransaction ? "Editar Movimiento" : "Nuevo Movimiento"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APORTE">Aporte</SelectItem>
                        <SelectItem value="COBRO">Cobro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue placeholder="Seleccionar moneda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD (Dólares)</SelectItem>
                        <SelectItem value="ARS">ARS (Pesos)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                        data-testid="input-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {currency === "ARS" && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-medium text-muted-foreground">Tipo de Cambio</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fxType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cotización</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "BLUE"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-fxtype">
                              <SelectValue placeholder="Seleccionar cotización" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FX_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {fxType === "MANUAL" ? (
                    <FormField
                      control={form.control}
                      name="fxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cambio (ARS/USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="1200.00" 
                              {...field} 
                              data-testid="input-fxrate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div>
                      <Label className="text-sm font-medium">Cotización Actual</Label>
                      <p className="mt-2 text-lg font-semibold" data-testid="text-current-fxrate">
                        {getFxRateDisplay()}
                      </p>
                    </div>
                  )}
                </div>
                
                {usdEquiv !== null && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Equivalente en USD: <span className="font-semibold text-foreground">USD {formatNumber(usdEquiv, 2)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del movimiento..." 
                      className="resize-none"
                      rows={2}
                      {...field} 
                      data-testid="input-note"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
                data-testid="button-submit"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : editingTransaction ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {editingTransaction ? "Guardar Cambios" : "Agregar Movimiento"}
              </Button>
              {editingTransaction && onCancelEdit && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onCancelEdit}
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
