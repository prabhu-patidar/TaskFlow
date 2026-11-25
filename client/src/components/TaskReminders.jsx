import { useEffect, useMemo, useState } from 'react';
import {
  Bell, Clock3, AlertCircle, Check, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { enablePushNotifications } from '../utils/pushNotifications';

export default function TaskReminders() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [tasks, setTasks] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    let active = true;

    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        if (active) {
          setTasks(data.tasks || []);
          setNow(Date.now());
        }
      } catch (error) {
        console.error('Reminder fetch failed:', error);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId]);

  const overdue = useMemo(
    () => tasks.filter(task =>
      task.dueDate &&
      task.status !== 'done' &&
      new Date(task.dueDate).getTime() <= now
    ),
    [tasks, now]
  );

  useEffect(() => {
    if (permission !== 'granted' || !userId || !('Notification' in window)) return;

    overdue.forEach(task => {
      const key = `taskflow-reminder-${userId}-${task._id}-${task.dueDate}`;
      const lastSent = Number(localStorage.getItem(key) || 0);

      if (Date.now() - lastSent < 60 * 60 * 1000) return;

      try {
        const notification = new Notification('TaskFlow: Task overdue', {
          body: `${task.title} is still pending.`,
          tag: key
        });

        localStorage.setItem(key, String(Date.now()));

        notification.onclick = () => {
          window.focus();
          window.location.href = '/tasks';
          notification.close();
        };
      } catch (error) {
        console.error('Notification failed:', error);
      }
    });
  }, [overdue, permission, userId]);

  const handleEnable = async () => {
    try {
      setLoading(true);
      setMessage('');
      await enablePushNotifications();
      setPermission(Notification.permission);
      setMessage('Push notifications enabled successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not enable notifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reminder-wrapper">
      <button
        className={`reminder-trigger ${open ? 'active' : ''}`}
        title="Task reminders"
        aria-label="Task reminders"
        onClick={() => setOpen(value => !value)}
      >
        <Bell size={21} />
        {overdue.length > 0 && (
          <span className="reminder-count">{overdue.length}</span>
        )}
      </button>

      {open && (
        <>
          <div className="reminder-backdrop" onClick={() => setOpen(false)} />

          <div className="reminder-panel">
            <div className="reminder-panel-header">
              <div>
                <h3>Task reminders</h3>
                <p>
                  {overdue.length
                    ? `${overdue.length} overdue ${overdue.length === 1 ? 'task' : 'tasks'} need attention`
                    : 'You are all caught up'}
                </p>
              </div>
              <span className="reminder-header-icon">
                <Bell size={19} />
              </span>
            </div>

            <div className="reminder-list">
              {overdue.length === 0 ? (
                <div className="reminder-empty">
                  <span><Check size={23} /></span>
                  <strong>No overdue tasks</strong>
                  <p>You're on track. Keep it that way!</p>
                </div>
              ) : (
                overdue.map(task => (
                  <div className="reminder-item" key={task._id}>
                    <span className="reminder-item-icon">
                      <AlertCircle size={18} />
                    </span>
                    <div className="reminder-item-content">
                      <strong>{task.title}</strong>
                      <small>
                        <Clock3 size={13} />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </small>
                    </div>
                    <span className="overdue-label">Overdue</span>
                  </div>
                ))
              )}
            </div>

            <div className="reminder-push-section">
              {permission === 'granted' ? (
                <div className="push-enabled">
                  <Check size={17} />
                  Desktop notifications enabled
                </div>
              ) : permission === 'denied' ? (
                <p className="push-message">
                  Notifications are blocked. Allow them in browser settings.
                </p>
              ) : permission === 'unsupported' ? (
                <p className="push-message">
                  Notifications are not supported in this browser.
                </p>
              ) : (
                <button
                  className="push-enable-button"
                  onClick={handleEnable}
                  disabled={loading}
                >
                  <Bell size={16} />
                  {loading ? 'Enabling...' : 'Enable push notifications'}
                </button>
              )}

              {message && <p className="push-message">{message}</p>}
            </div>

            <Link
              to="/tasks"
              className="reminder-view-all"
              onClick={() => setOpen(false)}
            >
              View all tasks <ArrowUpRight size={16} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}