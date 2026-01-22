import { StockAlerts } from "./components/StockAlerts";
import { StockList } from "./components/StockList";
import { useStock } from "./hooks/useStock";
import { Loader2 } from "lucide-react";

export const StockContent = () => {
  const { stockItems, lowStockCount, isLoading, handleAdjust, handleViewDetails } = useStock();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StockAlerts lowStockCount={lowStockCount} />

      <StockList
        items={stockItems}
        onAdjust={handleAdjust}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};
