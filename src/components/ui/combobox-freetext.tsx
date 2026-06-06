import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAddCustomValue, useCustomValues } from "@/hooks/useCustomValues";

interface ComboboxFreeTextProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  category?: string; // when provided, free-text values are auto-saved
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function ComboboxFreeText({
  value,
  onChange,
  options,
  category,
  placeholder = "Sélectionner...",
  emptyText = "Aucun résultat",
  disabled,
  className,
}: ComboboxFreeTextProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { data: customValues = [] } = useCustomValues(category ?? "__none__");
  const addCustom = useAddCustomValue();

  const merged = React.useMemo(() => {
    const set = new Map<string, string>();
    for (const o of options) if (o) set.set(o.toLowerCase(), o);
    if (category) for (const c of customValues) set.set(c.value.toLowerCase(), c.value);
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b, "fr"));
  }, [options, customValues, category]);

  const filtered = React.useMemo(() => {
    if (!query) return merged;
    const q = query.toLowerCase();
    return merged.filter((o) => o.toLowerCase().includes(q));
  }, [merged, query]);

  const exists = React.useMemo(
    () => merged.some((o) => o.toLowerCase() === query.trim().toLowerCase()),
    [merged, query]
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setQuery("");
    setOpen(false);
  };

  const handleAdd = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (category) {
      try {
        await addCustom.mutateAsync({ category, value: trimmed });
      } catch (e) {
        // non-blocking
        console.warn("addCustomValue failed", e);
      }
    }
    handleSelect(trimmed);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tapez pour rechercher ou créer..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim() && !exists) {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-2 text-sm text-muted-foreground">{emptyText}</div>
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => handleSelect(opt)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt}
                </CommandItem>
              ))}
              {query.trim() && !exists && (
                <CommandItem onSelect={handleAdd} className="text-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter « {query.trim()} »
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
