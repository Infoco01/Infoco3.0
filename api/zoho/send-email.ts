// /api/zoho/send-email.ts
import { zohoConfig } from './config';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de autorização ausente ou malformado.' });
        }
        const accessToken = authHeader.split(' ')[1];
        
        const { accountId, fromAddress, toAddress, subject, content } = req.body;
        if (!accountId || !fromAddress || !toAddress || !subject || !content) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes para enviar o e-mail.' });
        }

        const emailPayload = {
            fromAddress,
            toAddress,
            subject,
            content,
            askReceipt: 'no',
        };

        const sendResponse = await fetch(`${zohoConfig.apiBaseUrl}/accounts/${accountId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        const responseData = await sendResponse.json();

        if (sendResponse.status !== 200 || responseData.status.code !== 200) {
            console.error("Falha ao enviar e-mail via Zoho:", responseData);
            throw new Error(responseData.data?.message || 'Falha ao enviar o e-mail.');
        }
        
        res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });

    } catch (error: any) {
        console.error("Erro na API /api/zoho/send-email:", error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor ao enviar e-mail' });
    }
}
