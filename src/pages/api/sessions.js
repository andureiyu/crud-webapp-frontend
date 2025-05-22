import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sessions = await prisma.sessions.findMany({
        orderBy: { start_time: 'asc' },
        // If you want to join tutor/user info, add: include: { tutor: true, student: true, subject: true }
      });
      res.status(200).json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}