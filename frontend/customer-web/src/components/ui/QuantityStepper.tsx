"use client";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  disabled?: boolean;
}

export default function QuantityStepper({
  value,
  onChange,
  max,
  min = 1,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center bg-surface rounded-sm hairline w-fit overflow-hidden">
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        className="w-9 h-9 flex items-center justify-center text-ink-primary hover:bg-paper disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        aria-label="Decrease quantity"
      >
        <span className="material-symbols-outlined text-lg">remove</span>
      </button>

      {/* Value */}
      <span className="w-10 text-center font-mono text-sm text-ink-primary select-none tabular-nums font-semibold">
        {value}
      </span>

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        className="w-9 h-9 flex items-center justify-center text-ink-primary hover:bg-paper disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        aria-label="Increase quantity"
      >
        <span className="material-symbols-outlined text-lg">add</span>
      </button>
    </div>
  );
}
