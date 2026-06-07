import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import type { BoosterScheduleEntry } from '@/lib/database';

interface Props {
  value: BoosterScheduleEntry[];
  onChange: (next: BoosterScheduleEntry[]) => void;
  title?: string;
  description?: string;
}

export default function BoosterScheduleEditor({
  value,
  onChange,
  title = 'Calendrier des rappels',
  description = 'Définissez chaque dose (libellé) et son décalage en jours depuis la 1ère dose (0 = jour J).',
}: Props) {
  const update = (index: number, patch: Partial<BoosterScheduleEntry>) => {
    const next = value.map((e, i) => (i === index ? { ...e, ...patch } : e));
    onChange(next);
  };

  const add = () => {
    const lastOffset = value.length ? value[value.length - 1].offset_days : 0;
    const suggested = value.length === 0 ? 0 : lastOffset + 28;
    onChange([
      ...value,
      { label: value.length === 0 ? '1ère dose' : `Rappel ${value.length}`, offset_days: suggested },
    ]);
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock className="h-4 w-4" />
            {title}
          </Label>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Aucun rappel défini. Cliquez sur « Ajouter » pour en créer un.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-[1fr_140px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground">
            <span>Libellé</span>
            <span>Jours depuis J0</span>
            <span></span>
          </div>
          {value.map((entry, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_140px_40px] gap-2 items-center">
              <Input
                value={entry.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="ex: 1ère dose, Rappel 1..."
              />
              <Input
                type="number"
                min={0}
                value={entry.offset_days}
                onChange={(e) => update(i, { offset_days: Math.max(0, parseInt(e.target.value) || 0) })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                aria-label="Supprimer ce rappel"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
