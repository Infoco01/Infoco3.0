import React from 'react';
import Modal from './Modal';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ isOpen, onClose, pdfUrl, title }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="w-full h-[75vh]">
        <iframe
          src={pdfUrl}
          title={`Visualizador de PDF: ${title}`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </div>
    </Modal>
  );
};

export default PdfViewerModal;