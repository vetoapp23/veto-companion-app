import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/contexts/ClientContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAppLocale } from '@/i18n/useAppLocale';

interface ConfirmVaccinationReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaccination: any;
}

export function ConfirmVaccinationReminderModal({ 
  open, 
  onOpenChange, 
  vaccination 
}: ConfirmVaccinationReminderModalProps) {
  const { confirmVaccinationReminder, calculateDueDateFromProtocol } = useClients();
  const { toast } = useToast();
  const { t } = useTranslation('medical');
  const { t: tc } = useTranslation('common');
  const { bcp47 } = useAppLocale();
  
  const [formData, setFormData] = useState({
    datePerformed: format(new Date(), 'yyyy-MM-dd'),
    veterinarian: '',
    batchNumber: '',
    notes: '',
    newNextDueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.veterinarian) {
      toast({
        title: tc('error'),
        description: t('confirmReminder.vetRequired'),
        variant: "destructive"
      });
      return;
    }

    let newNextDueDate = formData.newNextDueDate;
    if (!newNextDueDate && vaccination) {
      const calculatedDate = calculateDueDateFromProtocol(
        vaccination.vaccineName,
        'chien',
        formData.datePerformed
      );
      newNextDueDate = calculatedDate || '';
    }

    const result = confirmVaccinationReminder(vaccination.id, {
      datePerformed: formData.datePerformed,
      veterinarian: formData.veterinarian,
      batchNumber: formData.batchNumber,
      notes: formData.notes,
      newNextDueDate: newNextDueDate
    });

    if (result) {
      toast({
        title: t('confirmReminder.confirmedTitle'),
        description: t('confirmReminder.confirmedBodyFull', { name: vaccination.vaccineName }),
      });
      
      setFormData({
        datePerformed: format(new Date(), 'yyyy-MM-dd'),
        veterinarian: '',
        batchNumber: '',
        notes: '',
        newNextDueDate: ''
      });
      
      onOpenChange(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!vaccination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('confirmReminder.modalTitle')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">{t('confirmReminder.vaccinationLabel')}</h4>
            <p className="text-sm text-muted-foreground">
              <strong>{vaccination.vaccineName}</strong> {t('confirmReminder.forPet', { petName: vaccination.petName })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('confirmReminder.scheduledOn', {
                date: new Date(vaccination.nextDueDate).toLocaleDateString(bcp47),
              })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="datePerformed">{t('confirmReminder.adminDate')} *</Label>
                <Input
                  id="datePerformed"
                  name="datePerformed"
                  type="date"
                  value={formData.datePerformed}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="veterinarian">{t('confirmReminder.vetName')} *</Label>
                <Input
                  id="veterinarian"
                  name="veterinarian"
                  value={formData.veterinarian}
                  onChange={handleChange}
                  placeholder={t('confirmReminder.vetPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="batchNumber">{t('confirmReminder.batchNumber')}</Label>
              <Input
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder={t('confirmReminder.batchPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="newNextDueDate">{t('confirmReminder.nextBooster')}</Label>
              <Input
                id="newNextDueDate"
                name="newNextDueDate"
                type="date"
                value={formData.newNextDueDate}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('confirmReminder.nextBoosterHint')}
              </p>
            </div>

            <div>
              <Label htmlFor="notes">{tc('notes')}</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder={t('confirmReminder.adminNotesPlaceholder')}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tc('cancel')}
              </Button>
              <Button type="submit">
                {t('confirmReminder.confirmButton')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
