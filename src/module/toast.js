import Toast from 'react-native-root-toast';

export function toast(msg) {
  Toast.show(msg, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
  });
}