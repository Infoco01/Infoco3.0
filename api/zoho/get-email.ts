// /api/zoho/get-email.ts
import { zohoConfig } from './config';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { messageId, accountId } = req.query;
        if (!messageId || !accountId) {
            return res.status(400).json({ error: 'messageId e accountId são obrigatórios.' });
        }
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de autorização ausente ou malformado.' });
        }
        const accessToken = authHeader.split(' ')[1];

        const emailResponse = await fetch(`${zohoConfig.apiBaseUrl}/accounts/${accountId}/messages/${messageId}`, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
            },
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            throw new Error(errorData.data?.message || 'Falha ao buscar o conteúdo do e-mail.');
        }

        const emailData = await emailResponse.json();

        // Simplificar o objeto de email completo
        const email = {
            messageId: emailData.data.messageId,
            from: emailData.data.from,
            to: emailData.data.toAddress.map((t: any) => ({ emailAddress: t.address, name: t.name })),
            subject: emailData.data.subject || '(Sem assunto)',
            summary: emailData.data.summary || '',
            receivedTime: new Date(Number(emailData.data.receivedTime)).toISOString(),
            isRead: emailData.data.isRead,
            content: emailData.data.content || 'Este e-mail não possui conteúdo para exibir.',
            attachments: emailData.data.attachments || [],
        };
        
        res.status(200).json(email);

    } catch (error: any) {
        console.error("Erro na API /api/zoho/get-email:", error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
}
