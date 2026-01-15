import { AlertTriangle } from "lucide-react";

interface DemoBannerProps {
  visible: boolean;
}

export function DemoBanner({ visible }: DemoBannerProps) {
  if (!visible) return null;

  return (
    <div 
      className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3"
      data-testid="banner-demo-mode"
    >
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Modo demo:</strong> Los datos no son persistentes. Al recargar la página se perderán los cambios.
        </p>
      </div>
    </div>
  );
}
