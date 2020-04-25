import NetInfo from '@react-native-community/netinfo';

const checkNetInfo = (callback = null, errorCallback = null) => {
  NetInfo.fetch().then(state => {
    console.log('checkNetInfo state', state);
    console.log('Connection type', state.type);
    console.log('Is connected?', state.isConnected);
    if (!state.isInternetReachable) {
      errorCallback && errorCallback();
      return;
    }
    callback && callback();
  });
};

export default {checkNetInfo};
