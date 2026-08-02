import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, Trash2, Edit, Eye, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getBcp47Locale } from '@/i18n/useAppLocale';

interface FarmPhoto {
  id: string;
  url: string;
  description: string;
  category: 'cheptel' | 'batiments' | 'equipements' | 'general';
  uploadedAt: string;
}

interface FarmPhotoManagerProps {
  photos: FarmPhoto[];
  onPhotosChange: (photos: FarmPhoto[]) => void;
  farmName: string;
}

const FarmPhotoManager: React.FC<FarmPhotoManagerProps> = ({ photos, onPhotosChange, farmName }) => {
  const { t, i18n } = useTranslation('app');
  const { t: tc } = useTranslation('common');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<FarmPhoto | null>(null);
  const [uploadForm, setUploadForm] = useState({
    description: '',
    category: 'general' as FarmPhoto['category']
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: FarmPhoto[] = Array.from(files).map((file) => {
      const reader = new FileReader();
      const photo: FarmPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: '',
        description: uploadForm.description || t('farmPhotos.photoOf', { name: farmName }),
        category: uploadForm.category,
        uploadedAt: new Date().toISOString()
      };

      reader.onload = (e) => {
        photo.url = e.target?.result as string;
        const updatedPhotos = [...photos, photo];
        onPhotosChange(updatedPhotos);
      };

      reader.readAsDataURL(file);
      return photo;
    });

    // Reset form
    setUploadForm({ description: '', category: 'general' });
    setIsUploadDialogOpen(false);
    
    toast({
      title: t('farmPhotos.addedTitle'),
      description: t('farmPhotos.addedBody', { count: newPhotos.length, name: farmName }),
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    onPhotosChange(updatedPhotos);
    
    toast({
      title: t('farmPhotos.deletedTitle'),
      description: t('farmPhotos.deletedBody'),
    });
  };

  const handleEditPhoto = (photo: FarmPhoto) => {
    setEditingPhoto(photo);
    setUploadForm({
      description: photo.description,
      category: photo.category
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingPhoto) return;

    const updatedPhotos = photos.map(photo =>
      photo.id === editingPhoto.id
        ? { ...photo, ...uploadForm }
        : photo
    );

    onPhotosChange(updatedPhotos);
    setIsEditDialogOpen(false);
    setEditingPhoto(null);
    setUploadForm({ description: '', category: 'general' });

    toast({
      title: t('farmPhotos.editedTitle'),
      description: t('farmPhotos.editedBody'),
    });
  };

  const getCategoryLabel = (category: FarmPhoto['category']) =>
    t(`farmPhotos.categories.${category}`);

  const getCategoryColor = (category: FarmPhoto['category']) => {
    const colors = {
      cheptel: 'bg-blue-100 text-blue-800',
      batiments: 'bg-green-100 text-green-800',
      equipements: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category];
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.category]) {
      acc[photo.category] = [];
    }
    acc[photo.category].push(photo);
    return acc;
  }, {} as Record<FarmPhoto['category'], FarmPhoto[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('farmPhotos.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('farmPhotos.subtitle')}
          </p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('farmPhotos.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('farmPhotos.addTitle')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="photo-description">{tc('description')}</Label>
                <Input
                  id="photo-description"
                  placeholder={t('farmPhotos.descriptionPlaceholder')}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="photo-category">{tc('category')}</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value: FarmPhoto['category']) => 
                    setUploadForm({ ...uploadForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheptel">{t('farmPhotos.categories.cheptel')}</SelectItem>
                    <SelectItem value="batiments">{t('farmPhotos.categories.batiments')}</SelectItem>
                    <SelectItem value="equipements">{t('farmPhotos.categories.equipements')}</SelectItem>
                    <SelectItem value="general">{t('farmPhotos.categories.general')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="photo-files">{t('farmPhotos.selectPhotos')}</Label>
                <Input
                  id="photo-files"
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('farmPhotos.empty')}</p>
            <p className="text-sm text-muted-foreground">
              {t('farmPhotos.emptyHint')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPhotos).map(([category, categoryPhotos]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className={getCategoryColor(category as FarmPhoto['category'])}>
                    {getCategoryLabel(category as FarmPhoto['category'])}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {t('farmPhotos.photoCount', { count: categoryPhotos.length })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryPhotos.map((photo) => (
                    <div key={photo.id} className="group relative">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={photo.url}
                          alt={photo.description}
                          className="w-full h-full object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingPhoto(photo)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditPhoto(photo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">{photo.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(photo.uploadedAt).toLocaleDateString(getBcp47Locale(i18n.language))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('farmPhotos.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingPhoto && (
              <div className="aspect-square rounded-lg overflow-hidden border">
                <img
                  src={editingPhoto.url}
                  alt={editingPhoto.description}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="edit-description">{tc('description')}</Label>
              <Input
                id="edit-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-category">{tc('category')}</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(value: FarmPhoto['category']) => 
                  setUploadForm({ ...uploadForm, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheptel">{t('farmPhotos.categories.cheptel')}</SelectItem>
                  <SelectItem value="batiments">{t('farmPhotos.categories.batiments')}</SelectItem>
                  <SelectItem value="equipements">{t('farmPhotos.categories.equipements')}</SelectItem>
                  <SelectItem value="general">{t('farmPhotos.categories.general')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {tc('cancel')}
              </Button>
              <Button onClick={handleSaveEdit}>
                {tc('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmPhotoManager;
