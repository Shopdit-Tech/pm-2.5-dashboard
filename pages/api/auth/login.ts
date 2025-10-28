import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const SUPABASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const response = await axios.post(
      `${SUPABASE_URL}/auth-login`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Login API Error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ error: 'Login failed' });
  }
}
