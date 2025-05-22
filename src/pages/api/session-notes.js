import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const notes = await prisma.session_notes.findMany({
        orderBy: { created_at: 'desc' },
        // Optionally: include session or author info if you want to display more
      });
      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}