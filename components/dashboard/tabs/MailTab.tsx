import React, { useContext, useState, useEffect } from 'react';
import { useMail } from '../../../contexts/MailContext';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Spinner from '../../ui/Spinner';
import Alert from '../../ui/Alert';
import Inbox from './mail/Inbox';
import EmailDetail from './mail/EmailDetail';
import ComposeMailModal from './mail/ComposeMailModal';
import { ZohoEmailListItem } from '../../../types';
import { LogIn, Mail } from 'lucide-react';

const MailTab: React.FC = () => {
    const { isAuthenticated, isConnecting, connect, error: authError, disconnect, accountInfo } = useMail();
    const [selectedEmail, setSelectedEmail] = useState<ZohoEmailListItem | null>(null);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    if (!isAuthenticated) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-10">
                <Mail size={48} className="text-blue-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Conectar ao Zoho Mail</h2>
                <p className="text-gray-600 mt-2 mb-6 max-w-md">Para gerenciar, ler e enviar e-mails, você precisa conectar sua conta do Zoho Mail ao sistema.</p>
                {authError && <Alert type="danger" message={authError} />}
                <Button onClick={connect} isLoading={isConnecting} size="lg">
                    <LogIn size={18} className="mr-2" />
                    Conectar com Zoho Mail
                </Button>
            </Card>
        );
    }
    
    return (
        <div className="h-[calc(100vh-160px)] flex flex-col gap-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                 <div>
                    <p className="font-semibold text-gray-800">Caixa de Entrada</p>
                    <p className="text-sm text-gray-500">{accountInfo?.primaryEmailAddress}</p>
                 </div>
                 <Button onClick={disconnect} variant="danger" size="sm">Desconectar</Button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
                <div className="lg:col-span-1 bg-white rounded-lg shadow-sm flex flex-col overflow-y-auto">
                    <Inbox onEmailSelect={setSelectedEmail} selectedEmailId={selectedEmail?.messageId} onCompose={() => setIsComposeOpen(true)} />
                </div>
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-y-auto">
                    <EmailDetail email={selectedEmail} />
                </div>
            </div>
            
            <ComposeMailModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
        </div>
    );
};

export default MailTab;
