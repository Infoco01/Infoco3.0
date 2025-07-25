import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { ZohoTokenData, ZohoAccountInfo, ZohoEmailListItem, ZohoEmail } from '../types';

interface MailContextType {
    tokens: ZohoTokenData | null;
    accountInfo: ZohoAccountInfo | null;
    isAuthenticated: boolean;
    isConnecting: boolean;
    error: string | null;
    connect: () => void;
    disconnect: () => void;
    saveTokens: (params: URLSearchParams) => void;
    listEmails: () => Promise<ZohoEmailListItem[]>;
    getEmailDetails: (messageId: string) => Promise<ZohoEmail | null>;
    sendEmail: (to: string, subject: string, content: string) => Promise<void>;
}

export const MailContext = createContext<MailContextType | null>(null);

export const MailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tokens, setTokens] = useLocalStorage<ZohoTokenData | null>('infoco_zoho_tokens', null);
    const [accountInfo, setAccountInfo] = useLocalStorage<ZohoAccountInfo | null>('infoco_zoho_account', null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!(tokens && tokens.access_token);
    
    const disconnect = useCallback(() => {
        setTokens(null);
        setAccountInfo(null);
        setError(null);
    }, [setTokens, setAccountInfo]);

    const getValidAccessToken = useCallback(async (): Promise<string | null> => {
        if (!tokens) {
            disconnect();
            return null;
        }

        // Checa se o token está expirado ou irá expirar em 5 minutos.
        if (Date.now() >= tokens.expires_at) {
            console.log("Token do Zoho expirado ou prestes a expirar, renovando...");
            // Token expirado, precisa renovar
            try {
                const response = await fetch('/api/zoho/refresh-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: tokens.refresh_token }),
                });

                const data = await response.json();
                if (!response.ok) {
                     // Se o refresh_token for inválido, o erro "invalid_code" pode ocorrer.
                    // Isso força o usuário a se autenticar novamente.
                    const errorMessage = data.error || "Falha ao renovar o token de acesso.";
                    throw new Error(errorMessage);
                }

                const newExpiresAt = Date.now() + (data.expires_in - 300) * 1000; // Subtrai 5 minutos de margem
                const newTokens = { ...tokens, access_token: data.access_token, expires_at: newExpiresAt };
                setTokens(newTokens);
                console.log("Token do Zoho renovado com sucesso.");
                return newTokens.access_token;

            } catch (err: any) {
                console.error("Erro ao renovar token, desconectando:", err);
                // Exibe o erro específico da API para o usuário, se disponível.
                const userFriendlyError = `Sua sessão com o Zoho expirou. Por favor, conecte-se novamente. (Erro: ${err.message})`;
                setError(userFriendlyError);
                disconnect();
                return null;
            }
        }
        return tokens.access_token;

    }, [tokens, setTokens, disconnect]);

    const connect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const response = await fetch('/api/zoho/auth-url');
            const data = await response.json(); // Sempre ler o corpo da resposta
            if (!response.ok) {
                // Se a resposta não for OK, usa a mensagem de erro específica do backend
                throw new Error(data.error || 'Falha ao obter a URL de autenticação.');
            }
            window.location.href = data.authUrl;
        } catch (err: any) {
            setError(err.message);
            setIsConnecting(false);
        }
    };

    const saveTokens = (params: URLSearchParams) => {
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');

        if (accessToken && expiresIn) {
            const expiresAt = Date.now() + (parseInt(expiresIn, 10) - 300) * 1000; // 5min de margem
            setTokens({
                access_token: accessToken,
                refresh_token: refreshToken || tokens?.refresh_token || '', // Mantem o refresh token se não vier um novo
                expires_at: expiresAt,
            });
            setError(null);
        } else {
            const errorMsg = params.get('error') || 'Falha na autenticação com o Zoho.';
            setError(errorMsg);
        }
    };

    const listEmails = async (): Promise<ZohoEmailListItem[]> => {
        const accessToken = await getValidAccessToken();
        if (!accessToken) throw new Error("Não autenticado.");
        
        const response = await fetch(`/api/zoho/list-emails`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha ao buscar e-mails.");
        
        if (!accountInfo) {
            setAccountInfo({ accountId: data.accountId, primaryEmailAddress: data.emails[0]?.from?.emailAddress || '' })
        }
        
        return data.emails;
    };

    const getEmailDetails = async (messageId: string): Promise<ZohoEmail | null> => {
        const accessToken = await getValidAccessToken();
        if (!accessToken || !accountInfo) throw new Error("Não autenticado ou conta não encontrada.");

        const response = await fetch(`/api/zoho/get-email?messageId=${messageId}&accountId=${accountInfo.accountId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha ao buscar detalhes do e-mail.");

        return data;
    };
    
    const sendEmail = async (to: string, subject: string, content: string): Promise<void> => {
        const accessToken = await getValidAccessToken();
        if (!accessToken || !accountInfo) throw new Error("Não autenticado ou conta não encontrada.");
        
        const response = await fetch(`/api/zoho/send-email`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accountId: accountInfo.accountId,
                fromAddress: accountInfo.primaryEmailAddress,
                toAddress: to,
                subject,
                content,
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha ao enviar e-mail.");
    };

    return (
        <MailContext.Provider value={{ tokens, accountInfo, isAuthenticated, isConnecting, error, connect, disconnect, saveTokens, listEmails, getEmailDetails, sendEmail }}>
            {children}
        </MailContext.Provider>
    );
};

export const useMail = (): MailContextType => {
    const context = useContext(MailContext);
    if (!context) {
        throw new Error('useMail deve ser usado dentro de um MailProvider');
    }
    return context;
};