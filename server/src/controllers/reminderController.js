import webpush from '../config/webPush.js';
import Task from '../models/Task.js';
import PushSubscription from '../models/PushSubscription.js';

export async function sendOverdueReminders(req, res, next) {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const tasks = await Task.find({
      dueDate: { $lte: now },
      status: { $ne: 'done' },
      $or: [
        { lastReminderAt: null },
        { lastReminderAt: { $lte: oneHourAgo } }
      ]
    });

    let sent = 0;

    for (const task of tasks) {
      const subscriptions = await PushSubscription.find({
        userId: task.user
      });

      let delivered = false;

      for (const record of subscriptions) {
        try {
          await webpush.sendNotification(
            record.subscription,
            JSON.stringify({
              title: 'TaskFlow: Task overdue',
              body: `${task.title} is still pending.`,
              url: '/tasks'
            })
          );
          delivered = true;
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await record.deleteOne();
          }
        }
      }

      if (delivered) {
        task.lastReminderAt = now;
        await task.save();
        sent++;
      }
    }

    res.json({ success: true, remindersSent: sent });
  } catch (error) {
    next(error);
  }
}