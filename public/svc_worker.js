// pushイベントハンドラを登録
self.addEventListener('push', (event) => {
  // 通知設定が行われているかをチェック
  if (!self.Notification || self.Notification.permission !== 'granted') {
    // 通知設定が行われていなければ何もせず終了
    return;
  }

  // 送信されたデータを取得

  if (event.data) {
    const data = event.data.text();
    console.log(data);

    event.waitUntil(
      self.registration.showNotification('Push Notification', {
        body: data,
      }),
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();
});
