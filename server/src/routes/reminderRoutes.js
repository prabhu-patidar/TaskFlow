import { Router } from 'express';
import { sendOverdueReminders } from '../controllers/reminderController.js';

const router = Router();

function verifyCronSecret(req, res, next) {
  const expected = process.env.REMINDER_CRON_SECRET;
  const received = req.headers['x-cron-secret'];

  if (!expected || received !== expected) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
}

router.post('/send', verifyCronSecret, sendOverdueReminders);

export default router;