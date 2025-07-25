// /api/zoho/list-emails.ts
import { zohoConfig } from './config';

async function getAccountId(accessToken: string): Promise<string> {
    const response = await fetch(`${zohoConfig.apiBaseUrl}/accounts`, {
        headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
        },
    });
    if (!response.ok) throw new Error('Falha ao buscar a conta do Zoho.');
    const data = await response.json();
    if (!data?.data?.[0]?.accountId) throw new Error('accountId não encontrado na resposta do Zoho.');
    return data.data[0].accountId;
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de autorização ausente ou malformado.' });
        }
        const accessToken = authHeader.split(' ')[1];
        
        const accountId = await getAccountId(accessToken);

        // Parâmetros para buscar emails: pode adicionar paginação aqui no futuro
        const params = new URLSearchParams({
            limit: '50',
            sortorder: 'desc',
            status: 'all',
        });

        const emailResponse = await fetch(`${zohoConfig.apiBaseUrl}/accounts/${accountId}/messages/view?${params.toString()}`, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
            },
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            throw new Error(errorData.data?.message || 'Falha ao buscar os e-mails.');
        }

        const emailData = await emailResponse.json();
        
        // Simplifica a resposta para o frontend
        const simplifiedEmails = emailData.data.map((email: any) => ({
            messageId: email.messageId,
            from: email.from,
            to: email.toAddress.map((t: any) => ({ emailAddress: t.address, name: t.name })),
            subject: email.subject || '(Sem assunto)',
            summary: email.summary || '',
            receivedTime: new Date(Number(email.receivedTime)).toISOString(),
            isRead: email.isRead,
        }));
        
        res.status(200).json({ emails: simplifiedEmails, accountId });

    } catch (error: any) {
        console.error("Erro na API /api/zoho/list-emails:", error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
}
