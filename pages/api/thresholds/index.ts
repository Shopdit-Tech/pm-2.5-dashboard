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
      // Get all thresholds
      const response = await axios.get(`${SUPABASE_URL}/thresholds-admin`, config);
      return res.status(200).json(response.data);
    } else if (method === 'POST') {
      // Create threshold
      const response = await axios.post(`${SUPABASE_URL}/thresholds-admin`, req.body, config);
      return res.status(201).json(response.data);
    } else if (method === 'PATCH') {
      // Update threshold
      const response = await axios.patch(`${SUPABASE_URL}/thresholds-admin`, req.body, config);
      return res.status(200).json(response.data);
    } else if (method === 'DELETE') {
      // Delete threshold
      const response = await axios.delete(`${SUPABASE_URL}/thresholds-admin`, {
        ...config,
        data: req.body,
      });
      return res.status(200).json(response.data);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Thresholds API Proxy Error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
