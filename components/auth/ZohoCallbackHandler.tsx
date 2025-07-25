import React, { useEffect, useContext } from 'react';
import { MailContext } from '../../contexts/MailContext';
import Spinner from '../ui/Spinner';

interface ZohoCallbackHandlerProps {
    onComplete: () => void;
}

const ZohoCallbackHandler: React.FC<ZohoCallbackHandlerProps> = ({ onComplete }) => {
    const mailContext = useContext(MailContext);
    
    useEffect(() => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const params = new URLSearchParams(hash);
            mailContext?.saveTokens(params);
            // Limpa o hash da URL e chama o onComplete
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            onComplete();
        }
    }, [mailContext, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <Spinner size="lg" />
            <p className="text-gray-600">Autenticando com o Zoho Mail, por favor aguarde...</p>
        </div>
    );
};

export default ZohoCallbackHandler;