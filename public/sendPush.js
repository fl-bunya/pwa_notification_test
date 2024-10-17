window.addEventListener('load', async (event) => {
  document
    .getElementById('pushButton')
    .addEventListener('click', sendPushMessage);
});

/**
 * Push通知送信ボタン
 *   /api/sendMessage にメッセージを送信する
 * @param {*} event
 */
const sendPushMessage = async (event) => {
  event.preventDefault();
  const message = document.getElementById('message').value;

  // FetchAPIのオプション準備
  const param = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },

    // リクエストボディ
    body: JSON.stringify({ message }),
  };

  await (await fetch('https://pwa-notification-test.onrender.com/api/sendMessage', param)).text();
};
