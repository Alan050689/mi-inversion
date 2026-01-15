import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, FileText } from "lucide-react";
import { formatCurrencyUSD, formatCurrencyARS, formatDate, formatNumber } from "@/lib/format";
import type { Transaction } from "@shared/schema";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
}

export function TransactionList({ 
  transactions, 
  isLoading, 
  onEdit,
  onDelete,
  isDeleting
}: TransactionListProps) {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Sin movimientos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Agregá tu primer aporte usando el formulario
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Movimientos ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">USD Equiv.</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((tx) => (
                <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                  <TableCell className="font-medium">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={tx.type === "APORTE" ? "default" : "secondary"}
                      className={tx.type === "APORTE" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }
                    >
                      {tx.type === "APORTE" ? (
                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownCircle className="h-3 w-3 mr-1" />
                      )}
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.currency}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {tx.currency === "USD" 
                      ? formatCurrencyUSD(tx.amount)
                      : formatCurrencyARS(tx.amount)
                    }
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {tx.currency === "ARS" && tx.usdEquivalent 
                      ? formatCurrencyUSD(tx.usdEquivalent)
                      : tx.currency === "USD" 
                        ? formatCurrencyUSD(tx.amount)
                        : "-"
                    }
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {tx.note || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(tx)}
                          disabled={isDeleting === tx.id}
                          data-testid={`button-edit-${tx.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(tx.id)}
                        disabled={isDeleting === tx.id}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${tx.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="sm:hidden divide-y">
          {sortedTransactions.map((tx) => (
            <div 
              key={tx.id} 
              className="p-4 space-y-2"
              data-testid={`card-transaction-${tx.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={tx.type === "APORTE" ? "default" : "secondary"}
                    className={tx.type === "APORTE" 
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }
                  >
                    {tx.type === "APORTE" ? (
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownCircle className="h-3 w-3 mr-1" />
                    )}
                    {tx.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(tx.date)}
                  </span>
                </div>
                <div className="flex gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(tx)}
                      disabled={isDeleting === tx.id}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(tx.id)}
                    disabled={isDeleting === tx.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono">
                  {tx.currency === "USD" 
                    ? formatCurrencyUSD(tx.amount)
                    : formatCurrencyARS(tx.amount)
                  }
                </span>
                <Badge variant="outline">{tx.currency}</Badge>
              </div>
              {tx.currency === "ARS" && tx.usdEquivalent && (
                <p className="text-sm text-muted-foreground">
                  Equivalente: {formatCurrencyUSD(tx.usdEquivalent)}
                  {tx.fxType && ` (${tx.fxType} @ ${formatNumber(tx.fxRate || 0)})`}
                </p>
              )}
              {tx.note && (
                <p className="text-sm text-muted-foreground">{tx.note}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
