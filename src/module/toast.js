// import Toast from 'react-native-root-toast';
import Toast from 'react-native-simple-toast';

export function toast(msg) {
  Toast.show(msg, Toast.SHORT);
  // Toast.show(msg, {
  //   duration: Toast.durations.SHORT,
  //   position: Toast.positions.BOTTOM,
  //   shadow: true,
  //   animation: true,
  // });
}

export function toastLong(msg) {
  Toast.show(msg, Toast.LONG);
  // Toast.show(msg, {
  //   duration: Toast.durations.LONG,
  //   position: Toast.positions.BOTTOM,
  //   shadow: true,
  //   animation: true,
  // });
}

export function toastError(msg) {
  Toast.show(msg, Toast.LONG);
  // Toast.show(msg, {
  //   duration: Toast.durations.SHORT,
  //   position: Toast.positions.BOTTOM,
  //   shadow: true,
  //   animation: true,
  //   backgroundColor: '#fcbe22',
  // });
}
