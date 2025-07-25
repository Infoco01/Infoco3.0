import React, { useState } from 'react';
import { useMail } from '../../../../contexts/MailContext';
import Modal from '../../../ui/Modal';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import Alert from '../../../ui/Alert';

interface ComposeMailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ComposeMailModal: React.FC<ComposeMailModalProps> = ({ isOpen, onClose }) => {
    const { sendEmail, accountInfo } = useMail();
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const handleClose = () => {
        // Não reseta os campos em caso de erro, para o usuário poder corrigir
        if (success) {
            setTo('');
            setSubject('');
            setContent('');
            setSuccess(null);
        }
        setError(null);
        onClose();
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await sendEmail(to, subject, content);
            setSuccess('E-mail enviado com sucesso!');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Falha ao enviar e-mail.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Escrever E-mail" size="lg">
            <form onSubmit={handleSend} className="space-y-4">
                {error && <Alert type="danger" message={error} />}
                {success && <Alert type="success" message={success} />}
                
                <Input
                    type="email"
                    placeholder="Para"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <Input
                    type="text"
                    placeholder="Assunto"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    placeholder="Digite sua mensagem aqui..."
                    required
                    disabled={isLoading}
                />
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" isLoading={isLoading}>Enviar</Button>
                </div>
                 {accountInfo?.primaryEmailAddress && <p className="text-xs text-gray-500 text-right">Enviando de: {accountInfo.primaryEmailAddress}</p>}
            </form>
        </Modal>
    );
};

export default ComposeMailModal;
