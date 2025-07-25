import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { User, UploadCloud } from 'lucide-react';
import Spinner from '../ui/Spinner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const authContext = useContext(AuthContext);
  if (!authContext) return null;

  const { user, updatePfp } = authContext;
  const [pfpPreview, setPfpPreview] = useState<string | null>(null);
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Revoke the object URL to avoid memory leaks
    return () => {
        if (pfpPreview && pfpPreview.startsWith('blob:')) {
            URL.revokeObjectURL(pfpPreview);
        }
    };
  }, [pfpPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          setError("O arquivo é muito grande. O limite é 2MB.");
          setPfpPreview(null);
          setPfpFile(null);
          return;
      }
      setPfpFile(file);
      setPfpPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!pfpFile) {
        setError("Por favor, selecione uma imagem primeiro.");
        return;
    }
    
    setIsUploading(true);
    setError(null);

    try {
        const response = await fetch(`/api/upload-blob?filename=${encodeURIComponent(pfpFile.name)}`, {
            method: 'POST',
            body: pfpFile,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao salvar a imagem.');
        }

        const newBlob = await response.json();
        updatePfp(newBlob.url);
        handleClose();

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsUploading(false);
    }
  };
  
  const handleClose = () => {
    setPfpPreview(null);
    setPfpFile(null);
    setError(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  const triggerFileSelect = () => fileInputRef.current?.click();

  const currentImage = pfpPreview || user?.pfp;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Alterar Foto de Perfil" size="sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300">
          {currentImage ? (
            <img src={currentImage} alt="Pré-visualização" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}
        </div>
        
        {error && <Alert type="danger" message={error} />}

        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
            disabled={isUploading}
        />

        <Button variant="secondary" onClick={triggerFileSelect} disabled={isUploading}>
            <UploadCloud size={16} className="mr-2" />
            Escolher Imagem
        </Button>
        
        <div className="w-full flex justify-end gap-4 pt-4 border-t">
            <Button variant="secondary" onClick={handleClose} disabled={isUploading}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!pfpFile || !!error} isLoading={isUploading}>
                Salvar Alterações
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;