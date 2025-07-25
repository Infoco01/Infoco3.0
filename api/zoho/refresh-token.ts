// /api/zoho/refresh-token.ts
import { zohoConfig, checkZohoCredentials } from './config';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        checkZohoCredentials();
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token é obrigatório.' });
        }

        const params = new URLSearchParams({
            refresh_token,
            client_id: zohoConfig.clientId!,
            client_secret: zohoConfig.clientSecret!,
            grant_type: 'refresh_token',
        });

        const response = await fetch(`${zohoConfig.accountsUrl}/oauth/v2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        const tokenData = await response.json();

        if (!response.ok) {
            throw new Error(tokenData.error || 'Falha ao renovar o token');
        }

        // Retorna apenas o novo access_token e sua validade
        return res.status(200).json({
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
        });

    } catch (error: any) {
        console.error("Erro ao renovar o token do Zoho:", error.message);
        return res.status(500).json({ error: error.message || 'Erro interno do servidor ao renovar o token.' });
    }
}
