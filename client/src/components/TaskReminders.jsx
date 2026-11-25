
import { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function TaskReminders() {
  const { user } = useAuth();

  const userId = user?.id || user?._id;

  const [tasks, setTasks] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(
    'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  // Fetch tasks immediately and every minute
  useEffect(() => {
    let active = true;

    const checkTasks = async () => {
      try {
        const { data } = await api.get('/tasks');

        if (active) {
          setTasks(data.tasks || []);
          setNow(Date.now());
        }
      } catch (error) {
        console.error('Reminder task fetch failed:', error);
      }
    };

    checkTasks();

    const interval = setInterval(checkTasks, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId]);

  // Find overdue tasks that are not completed
  const overdue = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') {
        return false;
      }

      return new Date(task.dueDate).getTime() <= now;
    });
  }, [tasks, now]);

  // Send a reminder every hour for each overdue task
  useEffect(() => {

    console.log('REMINDER DIAGNOSTIC:', {
  user,
  userId,
  permission,
  overdueCount: overdue.length
});

    if (
      permission !== 'granted' ||
      !userId ||
      !('Notification' in window)
    ) {
      return;
    }

    overdue.forEach(task => {
        console.log('TASK CHECK:', task.title, task.dueDate);
      const key = `taskflow-reminder-${userId}-${task._id}-${task.dueDate}`;

      const lastSent = Number(localStorage.getItem(key) || 0);
      const oneHour = 60 * 60 * 1000;

      console.log('COOLDOWN CHECK:', {
  key,
  lastSent,
  elapsedMinutes: (Date.now() - lastSent) / 60000
});

      if (Date.now() - lastSent < oneHour) {
        return;
      }

      try {
        console.log('SENDING NOTIFICATION NOW');
        const notification = new Notification(
          'TaskFlow: Task overdue',
          {
            body: `${task.title} is still pending.`,
            tag: `${key}-${Date.now()}`
          }
        );

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

  // Request notification permission
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <div className="reminder-wrapper">
      <button
        className="icon-btn reminder-button"
        title="Task reminders"
        onClick={() => setOpen(value => !value)}
      >
        <Bell size={20} />

        {overdue.length > 0 && (
          <span className="reminder-count">
            {overdue.length}
          </span>
        )}
      </button>

      {open && (
        <div className="reminder-panel">
          <h3>Task reminders</h3>

          {overdue.length === 0 ? (
            <p>No overdue tasks.</p>
          ) : (
            overdue.map(task => (
              <div className="reminder-item" key={task._id}>
                <strong>{task.title}</strong>
                <small>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </small>
              </div>
            ))
          )}

          {permission === 'default' && (
            <button
              className="btn btn-primary"
              onClick={enableNotifications}
            >
              Enable desktop notifications
            </button>
          )}

          {permission === 'denied' && (
            <p>Allow notifications in your browser settings.</p>
          )}

          {permission === 'unsupported' && (
            <p>Notifications are not supported in this browser.</p>
          )}

          <Link to="/tasks" onClick={() => setOpen(false)}>
            View all tasks
          </Link>
        </div>
      )}
    </div>
  );
}
