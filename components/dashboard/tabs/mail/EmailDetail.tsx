import React, { useState, useEffect } from 'react';
import { useMail } from '../../../../contexts/MailContext';
import { ZohoEmailListItem, ZohoEmail } from '../../../../types';
import Spinner from '../../../ui/Spinner';
import { formatDate } from '../../../../lib/utils';
import { MailOpen, AlertCircle } from 'lucide-react';

interface EmailDetailProps {
    email: ZohoEmailListItem | null;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email }) => {
    const { getEmailDetails } = useMail();
    const [fullEmail, setFullEmail] = useState<ZohoEmail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (email) {
            setIsLoading(true);
            setError(null);
            setFullEmail(null);
            getEmailDetails(email.messageId)
                .then(setFullEmail)
                .catch(err => setError(err.message || 'Erro ao carregar e-mail.'))
                .finally(() => setIsLoading(false));
        } else {
            setFullEmail(null);
        }
    }, [email, getEmailDetails]);

    if (!email) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                <MailOpen size={48} className="mb-4" />
                <h3 className="text-lg font-medium">Selecione um e-mail para ler</h3>
                <p className="text-sm">As mensagens da sua caixa de entrada serão exibidas aqui.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }
    
     if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-red-600 p-8 text-center">
                <AlertCircle size={48} className="mb-4" />
                <h3 className="text-lg font-medium">Não foi possível carregar o e-mail</h3>
                <p className="text-sm mt-2">{error}</p>
            </div>
        );
    }

    if (!fullEmail) return null;

    return (
        <div className="p-6 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{fullEmail.subject}</h2>
            <div className="border-b pb-4 mb-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-3">
                        {fullEmail.from.name ? fullEmail.from.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700">{fullEmail.from.name} <span className="text-gray-500 font-normal">&lt;{fullEmail.from.emailAddress}&gt;</span></p>
                        <p className="text-sm text-gray-500">Para: {fullEmail.to.map(t => t.name || t.emailAddress).join(', ')}</p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500 text-right">
                        {formatDate(fullEmail.receivedTime)}
                        <p>{new Date(fullEmail.receivedTime).toLocaleTimeString('pt-BR')}</p>
                    </div>
                </div>
            </div>
            <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: fullEmail.content }}
            />
        </div>
    );
};

export default EmailDetail;
