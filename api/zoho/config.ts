// /api/zoho/config.ts

// É CRUCIAL que estas variáveis de ambiente estejam definidas nas configurações do seu projeto Vercel.
// ZOHO_CLIENT_ID: O Client ID do seu aplicativo OAuth no Zoho.
// ZOHO_CLIENT_SECRET: O Client Secret do seu aplicativo OAuth no Zoho.
// APP_URL: A URL base da sua aplicação (ex: https://seu-app.vercel.app), usada para construir a Redirect URI.
// A Vercel provê a variável VERCEL_URL automaticamente para deploys de produção e preview.

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;

// Determina a URL da aplicação de forma mais robusta.
const getAppUrl = () => {
    // Para deploys na Vercel (produção ou preview)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Para desenvolvimento local ou outras plataformas
    return process.env.APP_URL || 'http://localhost:5173';
}

const APP_URL = getAppUrl();


// As contas do Zoho podem estar em diferentes data centers (.com, .eu, .in, etc.)
// Certifique-se de que este corresponde à sua conta.
const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.com';
const ZOHO_API_BASE_URL = 'https://mail.zoho.com/api';

const ZOHO_REDIRECT_URI = `${APP_URL}`; // O app irá lidar com o hash na URL base

const ZOHO_SCOPES = [
    'ZohoMail.accounts.READ',
    'ZohoMail.messages.ALL', // READ, CREATE, UPDATE, DELETE
].join(',');

export const zohoConfig = {
    clientId: ZOHO_CLIENT_ID,
    clientSecret: ZOHO_CLIENT_SECRET,
    redirectUri: ZOHO_REDIRECT_URI,
    scopes: ZOHO_SCOPES,
    accountsUrl: ZOHO_ACCOUNTS_URL,
    apiBaseUrl: ZOHO_API_BASE_URL,
};

// Checa as credenciais e lança um erro detalhado se alguma estiver faltando.
export function checkZohoCredentials() {
    const missingVars = [];
    if (!ZOHO_CLIENT_ID) missingVars.push('ZOHO_CLIENT_ID');
    if (!ZOHO_CLIENT_SECRET) missingVars.push('ZOHO_CLIENT_SECRET');

    if (missingVars.length > 0) {
        const errorMessage = `A integração com o Zoho Mail não pode ser inicializada. As seguintes variáveis de ambiente estão faltando: ${missingVars.join(', ')}. Por favor, adicione-as nas configurações do projeto na Vercel e faça um novo deploy.`;
        console.error(`ERRO CRÍTICO (Zoho Config): ${errorMessage}`);
        throw new Error(errorMessage);
    }
}
