import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

/**
 * API Proxy: Get latest sensors
 * This avoids CORS issues by proxying the request through Next.js server
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { movable } = req.query;

    console.log(`🌐 [API Proxy] Fetching sensors (movable=${movable})`);

    // Make request to Supabase with API key on server side
    const response = await axios.get(`${API_BASE_URL}/sensors-latest`, {
      params: { movable },
      headers: {
        'x-ingest-key': API_KEY,
      },
      timeout: 30000,
    });

    console.log(`✅ [API Proxy] Success: ${response.data.count} sensors`);

    // Return the response to client
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('❌ [API Proxy] Error:', error.message);

    if (error.response) {
      // Forward the error from Supabase
      res.status(error.response.status).json({
        error: error.response.data || 'API request failed',
      });
    } else {
      // Network or other error
      res.status(500).json({
        error: 'Failed to fetch sensors',
        message: error.message,
      });
    }
  }
}
