// /api/zoho/auth-url.ts
import { zohoConfig, checkZohoCredentials } from './config';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        checkZohoCredentials();
        
        const params = new URLSearchParams({
            scope: zohoConfig.scopes,
            client_id: zohoConfig.clientId!,
            response_type: 'token', // Usando fluxo implícito para obter o token diretamente no frontend
            redirect_uri: zohoConfig.redirectUri,
            access_type: 'offline', // Para obter um refresh_token
        });

        const authUrl = `${zohoConfig.accountsUrl}/oauth/v2/auth?${params.toString()}`;
        
        res.status(200).json({ authUrl });

    } catch (error: any) {
        console.error("Erro ao gerar a URL de autenticação do Zoho:", error);
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
}
