import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get only Algebra (subject_id=1) and Physics (subject_id=3)
      const subjects = await prisma.subjects.findMany({
        where: {
          subject_id: { in: [1, 3] },
        },
        include: {
          tutors: {
            include: {
              users: true, // Get tutor's user info (name, photo, etc)
            },
          },
        },
      });
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}