import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min = 0, max, step = 1, disabled, ...props }, ref) => {
    const handleIncrement = () => {
      const currentValue = typeof value === 'string' ? parseInt(value) || min : value;
      const newValue = currentValue + step;
      if (max === undefined || newValue <= max) {
        onChange(newValue);
      }
    };

    const handleDecrement = () => {
      const currentValue = typeof value === 'string' ? parseInt(value) || min : value;
      const newValue = currentValue - step;
      if (newValue >= min) {
        onChange(newValue);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value) || min;
      if ((max === undefined || newValue <= max) && newValue >= min) {
        onChange(newValue);
      }
    };

    return (
      <div className="flex items-center gap-1">
        <Input
          ref={ref}
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className={cn("text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none", className)}
          {...props}
        />
        
        <div className="flex flex-col gap-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-6 p-0 hover:bg-muted"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && typeof value === 'number' && value >= max)}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-6 p-0 hover:bg-muted"
            onClick={handleDecrement}
            disabled={disabled || (typeof value === 'number' && value <= min)}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
