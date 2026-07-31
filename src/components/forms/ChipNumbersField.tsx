import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ChipNumbersFieldProps {
  value: string[];
  onChange: (chips: string[]) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
}

/** Parse one or several chip IDs (virgule, point-virgule, espace, retour ligne). */
export function parseChipNumbers(raw: string): string[] {
  return raw
    .split(/[,;\s\n\r]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

export function ChipNumbersField({
  value,
  onChange,
  label = "Numéros de puces",
  hint = "Saisissez un numéro puis Ajouter, ou collez plusieurs (séparés par virgule / espace).",
  placeholder = "Ex: 250269604123456",
  disabled,
}: ChipNumbersFieldProps) {
  const [input, setInput] = useState("");

  const add = () => {
    const next = parseChipNumbers(input);
    if (!next.length) return;
    const merged = [...value];
    for (const chip of next) {
      if (!merged.includes(chip)) merged.push(chip);
    }
    onChange(merged);
    setInput("");
  };

  const remove = (chip: string) => onChange(value.filter((c) => c !== chip));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add} disabled={disabled || !input.trim()}>
          Ajouter
        </Button>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {value.map((chip) => (
            <Badge key={chip} variant="secondary" className="gap-1 font-mono text-xs">
              {chip}
              {!disabled && (
                <X className="h-3 w-3 cursor-pointer" onClick={() => remove(chip)} aria-label={`Retirer ${chip}`} />
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
