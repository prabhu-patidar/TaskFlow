import { useState } from 'react';
import { enablePushNotifications } from '../utils/pushNotifications';

export default function PushNotificationButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEnable = async () => {
    try {
      setLoading(true);
      setMessage('');
      await enablePushNotifications();
      setMessage('Push notifications enabled!');
    } catch (error) {
      setMessage(error.message || 'Could not enable notifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={handleEnable}
        disabled={loading}
      >
        {loading ? 'Enabling...' : 'Enable Push Notifications'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}