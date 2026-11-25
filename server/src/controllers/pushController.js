import PushSubscription from '../models/PushSubscription.js';

export async function subscribe(req, res, next) {
  try {
    const { subscription } = req.body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ message: 'Invalid push subscription' });
    }

    await PushSubscription.findOneAndUpdate(
      { 'subscription.endpoint': subscription.endpoint },
      {
        userId: req.user._id,
        subscription
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ message: 'Push subscription saved' });
  } catch (error) {
    next(error);
  }
}

export async function unsubscribe(req, res, next) {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint is required' });
    }

    await PushSubscription.deleteOne({
      userId: req.user._id,
      'subscription.endpoint': endpoint
    });

    res.json({ message: 'Push subscription removed' });
  } catch (error) {
    next(error);
  }
}