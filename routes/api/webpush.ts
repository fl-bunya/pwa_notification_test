import express from 'express';
import webPush from 'web-push';
import vapidKey from '../../vapidKey.json'; // generateKey.tsで生成したキーペア

var router = express.Router();

webPush.setVapidDetails(
  'mailto:hoge@example.com',
  vapidKey.publicKey,
  vapidKey.privateKey,
);

/**
 * ブラウザにキーを公開するためのメソッド
 * (必ずしもapiで公開する必要はない。手順簡略化のため)
 */
router.get('/vapidPublicKey', async (req, res, next) => {
  return res.send(vapidKey.publicKey);
});

/**
 * curlからのPush送信テスト用Api
 *  ・curlからendpointを受け取りpush通知を行う(送信メッセージは固定)
 */
router.post('/curlPushTest', async (req, res, next) => {
  console.log(req.body);

  try {
    const response = await webPush.sendNotification(
      req.body,
      'Web Push通知テスト',
    );

    return res.json({
      statusCode: response.statusCode || -1,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// endPoint保存用(Push通知送信先)
let endPoint: string = '';

/**
 * endPointをサーバに保存後するApi
 * (保存後、送信画面へリダイレクト)
 */
router.post('/registEndpoint', async (req, res, next) => {
  console.log(req.body);
  endPoint = req.body['endpoint'];
  res.redirect('/sendPush.html');
});

/**
 * 登録されたendpointへメッセージを送信するApi
 * sendPush.jsから呼び出される
 */
router.post('/sendMessage', async (req, res, next) => {
  console.log(endPoint);
  try {
    const response = await webPush.sendNotification(
      JSON.parse(endPoint),
      req.body['message'],
    );

    return res.json({
      statusCode: response.statusCode || -1,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = router;
export default router;
