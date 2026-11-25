self.addEventListener('push', event => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data?.text() || 'You have a pending task.' };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'TaskFlow Reminder',
      {
        body: data.body || 'You have an overdue task.',
        icon: '/favicon.ico',
        data: { url: data.url || '/tasks' }
      }
    )
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/tasks')
  );
});