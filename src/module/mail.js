import qs from 'qs';
import {Linking} from 'react-native';

// ref: https://medium.com/plark/react-native-how-to-send-email-86714feaa97c
export async function sendEmail(to, subject, body, options = {}) {
  const {cc, bcc} = options;

  let url = `mailto:${to}`;

  // Create email link query
  const query = qs.stringify({
    subject: subject,
    body: body,
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
