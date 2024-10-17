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

/**
 * 公開鍵(base64)をUint8Arrayに変換する(subscribeの引数用)
 * @param {*} base64String
 * @returns
 */
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

/**
 * Service Workerを登録する
 */
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const swReg = await navigator.serviceWorker.register('./svc_worker.js');
      console.log('Service Worder is registerd', swReg);

      // サーバから公開キーを取得
      const vapidPublicKey = await (await fetch('http://192.168.9.251:7777/api/vapidPublicKey')).text();

      const options = {
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidPublicKey),
      };

      // Push通知を購読する
      const reg = await navigator.serviceWorker.ready;
      await reg.pushManager.subscribe(options);

      // Push通知表示を許可するための確認を表示
      Notification.requestPermission((permission) => {
        console.log(permission); // 'default', 'granted', 'denied'
      });

      // ServiceWorkerの状態を画面に表示する
      await checkServiceWorkerRegistered();
    } catch (err) {
      console.log(`Service Worker registration failed: ${err}`);
      await checkServiceWorkerRegistered();
    }
  }
};

/**
 * Service Workerの登録を解除する
 */
const unregisterServiceWorker = async () => {
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

/**
 * Servie Workerが登録されているかチェック
 * 「登録」「登録解除」ボタンを切り替える
 */
const checkServiceWorkerRegistered = async () => {
  // Servie Workerが登録されているかチェックする
  const swReg = await navigator.serviceWorker.getRegistration();

  const elInst = document.getElementById('install-svcw');
  const elUninst = document.getElementById('uninstall-svcw');
  if (swReg) {
    // 登録されている場合、登録解除ボタンを表示する
    elUninst.removeAttribute('style');
    elInst.setAttribute('style', 'display:none;');

    // Push通知を購読しているか確認する
    const subscription = await swReg.pushManager.getSubscription();
    if (subscription) {
      // 購読している場合、curlでPush通知の疎通確認をするコマンドを表示する
      const jsonSub = JSON.stringify(subscription);
      const cmdArea = document.querySelector('.js-subscription-json');
      cmdArea.textContent = `curl http://192.168.9.251:7777/api/curlPushTest -X POST -H "Content-Type: application/json" -d '${jsonSub}'`;

      // push送信画面用にEndPointをセットする。
      //  ⇒Push送信画面を開く際、endpointをサーバに送信する。
      //    サーバはendpointを保存し、そこへPush通知を行う。
      const hidden = document.getElementById('endpoint');
      hidden.value = jsonSub;
    }
  } else {
    // 登録されていない場合、登録ボタンを表示する
    elInst.removeAttribute('style');
    elUninst.setAttribute('style', 'display:none;');
  }
};
