import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const SUPABASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, headers } = req;

  try {
    // Forward Authorization header
    const authHeader = headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const config = {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    if (method === 'GET') {
      // Get all users
      const response = await axios.get(`${SUPABASE_URL}/users-admin`, config);
      return res.status(200).json(response.data);
    } else if (method === 'POST') {
      // Create user
      const response = await axios.post(`${SUPABASE_URL}/users-admin`, req.body, config);
      return res.status(200).json(response.data);
    } else if (method === 'DELETE') {
      // Delete user
      const { user_id } = req.query;
      
      if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const response = await axios.delete(`${SUPABASE_URL}/users-admin`, {
        ...config,
        params: { user_id },
      });
      
      return res.status(200).json(response.data);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('API Proxy Error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
