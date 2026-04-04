import { useLargeText } from "@/hooks/use-large-text";

interface LargeTextToggleProps {
  className?: string;
}

export function LargeTextToggle({ className = "" }: LargeTextToggleProps) {
  const { largeText, toggleLargeText } = useLargeText();

  return (
    <button
      onClick={toggleLargeText}
      className={`px-3 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border font-semibold transition-colors ${
        largeText ? "text-primary border-primary/40 text-base" : "text-foreground/70 text-sm"
      } ${className}`}
      title="Toggle large text mode"
    >
      {largeText ? "Aa−" : "Aa+"}
    </button>
  );
}
