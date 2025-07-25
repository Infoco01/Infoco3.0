import React, { useState, useEffect, useCallback } from 'react';
import { useMail } from '../../../../contexts/MailContext';
import { ZohoEmailListItem } from '../../../../types';
import EmailListItem from './EmailListItem';
import Spinner from '../../../ui/Spinner';
import Button from '../../../ui/Button';
import { Edit, RefreshCw, AlertCircle } from 'lucide-react';

interface InboxProps {
    onEmailSelect: (email: ZohoEmailListItem | null) => void;
    selectedEmailId?: string;
    onCompose: () => void;
}

const Inbox: React.FC<InboxProps> = ({ onEmailSelect, selectedEmailId, onCompose }) => {
    const { listEmails } = useMail();
    const [emails, setEmails] = useState<ZohoEmailListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedEmails = await listEmails();
            setEmails(fetchedEmails);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    }, [listEmails]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between gap-2">
                <Button onClick={onCompose} size="sm" className="flex-1">
                    <Edit size={16} className="mr-2" /> Escrever
                </Button>
                <Button onClick={fetchEmails} variant="secondary" size="sm" className="p-2" disabled={isLoading}>
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <Spinner />
                    </div>
                )}
                {error && (
                     <div className="p-4 text-center text-red-600">
                        <AlertCircle className="mx-auto w-8 h-8 mb-2" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {!isLoading && !error && emails.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        <p>Sua caixa de entrada está vazia.</p>
                    </div>
                )}
                {!isLoading && emails.length > 0 && (
                    <ul>
                        {emails.map(email => (
                            <EmailListItem
                                key={email.messageId}
                                email={email}
                                isSelected={email.messageId === selectedEmailId}
                                onSelect={() => onEmailSelect(email)}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Inbox;
