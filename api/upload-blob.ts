// /api/upload-blob.ts
import { put } from '@vercel/blob';

// Vercel Blob needs environment variables set in the project settings.
// Ensure BLOB_READ_WRITE_TOKEN is set.

// Disable the default body parser to handle file streams.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        const message = 'A variável de ambiente BLOB_READ_WRITE_TOKEN não foi encontrada. Por favor, conecte um Vercel Blob store ao seu projeto e faça um novo deploy.';
        console.error(`Erro de configuração em /api/upload-blob: ${message}`);
        return res.status(500).json({ error: message });
    }

    const filename = req.query.filename;
    if (!filename) {
        return res.status(400).json({ error: '`filename` query parameter is required.' });
    }

    try {
        // The request body is a stream. Vercel Blob's `put` can handle it directly.
        const blob = await put(filename, req, {
            access: 'public',
        });
        
        return res.status(200).json(blob);

    } catch (error: any) {
        console.error("Error in /api/upload-blob:", error);
        return res.status(500).json({ error: error.message || 'Failed to upload file.' });
    }
}