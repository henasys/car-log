import 'react-native-gesture-handler';
import * as React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';

import Navigator from './src/module/navigator';
import MyStack from './src/screen/stack';

function App() {
  const [isReady, setIsReady] = React.useState(false);
  React.useEffect(() => {
    console.log('App useEffect');
    Navigator.isMountedRef.current = true;
    if (isReady) {
      const currentRouteName = Navigator.getActiveRouteName();
      Navigator.routeNameRef.current = currentRouteName;
      console.log('init currentRouteName', currentRouteName);
    }
    return () => (Navigator.isMountedRef.current = false);
  }, [isReady]);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={ref => {
          console.log('NavigationContainer ref');
          Navigator.navigationRef.current = ref;
          setIsReady(true);
        }}
        onStateChange={state => {
          // console.log('New state is', state);
          const currentRouteName = Navigator.getActiveRouteName(state);
          Navigator.routeNameRef.current = currentRouteName;
          console.log('currentRouteName', currentRouteName);
        }}>
        <MyStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
