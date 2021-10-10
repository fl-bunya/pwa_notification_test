window.addEventListener('load', async (event) => {
  document
    .getElementById('pushButton')
    .addEventListener('click', sendPushMessage);
});

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

  await (await fetch('/api/sendMessage', param)).text();
};
