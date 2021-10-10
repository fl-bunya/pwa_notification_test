window.addEventListener('load', async (event) => {
  // 各種イベントハンドラを登録
  // 「インストール」ボタンをクリック→registerServiceWorker()を実行
  document
    .getElementById('install_svcworker')
    .addEventListener('click', registerServiceWorker);

  // 「インストール」ボタンをクリック→unregisterServiceWorker()を実行
  document
    .getElementById('uninstall_svcworker')
    .addEventListener('click', unregisterServiceWorker);

  // ページロード時にService Workerの登録状況をチェックする
  await checkServiceWorkerRegistered();
});

const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const registerServiceWorker = async () => {
  // Service Workerを登録する
  if ('serviceWorker' in navigator) {
    try {
      const swReg = await navigator.serviceWorker.register('./svc_worker.js');
      console.log('Service Worder is registerd', swReg);

      const vapidPublicKey = await (await fetch('/api/vapidPublicKey')).text();

      const options = {
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidPublicKey),
      };

      const reg = await navigator.serviceWorker.ready;
      await reg.pushManager.subscribe(options);

      Notification.requestPermission((permission) => {
        console.log(permission); // 'default', 'granted', 'denied'
      });

      await checkServiceWorkerRegistered();
    } catch (err) {
      console.log(`Service Worker registration failed: ${err}`);
      await checkServiceWorkerRegistered();
    }
  }
};

const unregisterServiceWorker = async () => {
  // Service Workerの登録を解除する
  if ('serviceWorker' in navigator) {
    try {
      const swReg = await navigator.serviceWorker.getRegistration();
      const subscription = await swReg.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      await swReg.unregister();

      await checkServiceWorkerRegistered();
    } catch (err) {
      console.log(err);
    }
  }
};

const checkServiceWorkerRegistered = async () => {
  // Servie Workerが登録されているかチェックする
  const swReg = await navigator.serviceWorker.getRegistration();

  const elInst = document.getElementById('install-svcw');
  const elUninst = document.getElementById('uninstall-svcw');
  if (swReg) {
    elUninst.removeAttribute('style');
    elInst.setAttribute('style', 'display:none;');
    const subscription = await swReg.pushManager.getSubscription();
    if (subscription) {
      const jsonSub = JSON.stringify(subscription);
      const cmdArea = document.querySelector('.js-subscription-json');
      cmdArea.textContent = `curl http://localhost:3000/api/curlPushTest -X POST -H "Content-Type: application/json" -d '${jsonSub}'`;

      // push送信画面用
      const hidden = document.getElementById('endpoint');
      hidden.value = jsonSub;
    }
  } else {
    elInst.removeAttribute('style');
    elUninst.setAttribute('style', 'display:none;');
  }
};
