import webpush from 'web-push';
console.log(JSON.stringify(webpush.generateVAPIDKeys()));
// '{"publicKey":"BFK...GNY","privateKey":"g0y...7jY"}'
