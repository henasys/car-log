import qs from 'qs';
import {Linking} from 'react-native';
import Mailer from 'react-native-mail';

// ref: https://medium.com/plark/react-native-how-to-send-email-86714feaa97c
export async function sendEmailWithLinking(to, subject, body, options = {}) {
  const {cc, bcc} = options;

  let url = `mailto:${to}`;

  // Create email link query
  const query = qs.stringify({
    subject: subject,
    body: attach(body),
    cc: cc,
    bcc: bcc,
  });

  if (query.length) {
    url += `?${query}`;
  }

  console.log('sendEmail url', url);

  // check if we can use this link
  const canOpen = await Linking.canOpenURL(url);

  if (!canOpen) {
    throw new Error('Provided URL can not be handled');
  }

  return Linking.openURL(url);
}

export function multipart(body, filename, contentType, attachment) {
  const multipartSep = '---dkdkekekakkskekkekkakakse----';

  const multiparts =
    `${multipartSep}\r\n` +
    'Content-Type: text/plain\r\n' +
    'Content-Transfer-Encoding: 7bit\r\n' +
    '\r\n' +
    `${body}\r\n` +
    `${multipartSep}\r\n` +
    `Content-Type: ${contentType}\r\n` +
    'Content-Transfer-Encoding: base64\r\n' +
    `Content-Disposition: attachment; filename=${filename}` +
    '\r\n' +
    `${attachment}\r\n` +
    `${multipartSep}`;
  return multiparts;
}

const attachmentData =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAExUlEQVR4nO2aXYhVVRTHf3fuaFgzgeRkjUSJTpFkBVlUSGRBSAWNJPSlgjiEkGUPldZT2VM99GIP9hCkFlRCRV9EETOmFRXSB335VUaT3lGqScu0O87tYe3jXufMPvfue+ecM0H7DwfOOXvttf77e521DgQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBPxPUJ5g+73AxcB3QK1FHWWgz+j5MiNehaAXaXQN2Exrg1E2dSM9yzNjVwDexxKvAS8B7U3ULwMbEzp2ZMwxN8wEThAnXwNeAU7zqN8BvOaoXwMuzYFv5liHJfw78QZ8DyzCvSTKwGJgd6KO1rG+GSKlluiPD2XgR+Ac87wAuBVYlZA7BPQDv5jnGcB1wLSE3Hpk5vSb59+M7LFMWWeIhdjR2oUdhD5gGPe0dl3DwApTt2R0RWV3FNCOlvEylujaRNkZwJPAIOkNHwSeMLIaa5XMe75kil4C05ApPRkYAc4F9jvkSshmNgeYbt4NAd8gZ73LZ+gGfkJOklFgFrAvO+rZ4H7sKL2eg/43lP7HctA/bnyBJdibg/5FSv/PTLynG8MVWHJDwKQcbLQDB5SdGxpVaMuBRBpWqPtNQDUHGyPACyk2JxRTiDsrc3K0dQGyCdaA40BXjra8sQzb+A8LsPeRsre6AHsNMYAl1Jci0wYsMVe949lHrk/Z+6p5utmiBzsljwCdKXJLsKTvqqPPR67T2IrkLk9TVsQmuBw7UlsQYnnjiLEVYcI2w3bE84tGYn4d2RIyondSfwn4ys1XdoeBU71ZZ4ibFYmdFO96R6G2GrC0YNsAvKoIPDQB9tco+wNFG58O/GOMV4GziyaQ4DAKzE4K5LkJLsO6u28jLmrRGALeMfclCg6afoudfrcUaTgBHX0+QHOB15ZxtTJaIZ8PH1+0IzGHiM9NujCvJaDP3Y3k8+HjixHgefWcu0/QARzG9viFeRv0wPlYb7QKnOVTqQv5sjq9SWO3YRu/vcm6eWI7ltfd0UvXErgRybAcRGL0fyBOzHPASiQHVy/SskDdvzgexhlDc7k2TehB/ELSh5HU1jpsfD/CgJKblwXzjDAPy+szl8BVxNNVfyMJjCr1O+PrhJ6tquy/lKaai+V1Moeol8Bq9bwNyd/NBKYi0/oRJJJ7MKE4ea5W1P0lTZIsAxchg+GK5HQBVxpezX5XzFX3FZfAPvx37lnIF9mjjHUv71V6tnmSKwH3GWJR3RPAW0Z/D+JN6hm6H9mTfDuiX9Vd4xI4pASmeip1oRs4qnSt9KjzDOlL7FdzpZU/TeNOWKXkjwPnuYQ+VkIPeJCuh6eUrirS42ku6GLiDRoEPkccmGRjq6askniflmM4BXic+MyJZY91z92D9CZGcAuSyBht2Nyx6AAeJn5cVoB3gT3IzxC7zPutwDXmfhPiqY0AlyHTNgqh/YkcXzuQ1NqzSHgMJGW2WdmagiydhcRziJ8i+9lRF+lJyJr1OQbHe+1RdnXsbkaC0wZVtiFR1t2kzQ+AM10N1+hE/ObIbSyiA/Y63kVYquq4AqB7aWzrByQn6fzuSds8ZgPXIyMyOUWmVfyFeGW7zXMPEjp7U72L0IbE/kAyPrVEeQ9wO2N/qzmG+DA7gU8c9U7iX2eOzVCyYTosAAAAAElFTkSuQmCC';

export function attach(body) {
  const filename = 'cat.png';
  const contentType = 'image/png';
  return multipart(body, filename, contentType, attachmentData);
}

export const sendEmailWithMailer = (
  to,
  subject,
  body,
  isHTML = false,
  attachment = {},
  callback = null,
) => {
  Mailer.mail(
    {
      subject: subject,
      recipients: [to],
      body: body,
      isHTML: isHTML,
      attachment: attachment,
    },
    (error, event) => {
      callback && callback(error, event);
      console.log('Mailer.mail error', error);
      console.log('Mailer.mail event', event);
    },
  );
};
