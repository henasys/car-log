import 'react-native-gesture-handler';
import * as React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';

import Navigator from './src/module/navigator';
import MyStack from './src/screen/stack';

function App() {
  React.useEffect(() => {
    Navigator.isMountedRef.current = true;
    // if (RootNavigator.navigationRef.current) {
    const state = Navigator.navigationRef.current.getRootState();
    console.log('init state', state);
    Navigator.routeNameRef.current = Navigator.getActiveRouteName(state);
    // }
    return () => (Navigator.isMountedRef.current = false);
  }, []);
  return (
    <NavigationContainer
      ref={Navigator.navigationRef}
      onStateChange={state => {
        console.log('New state is', state);
        const currentRouteName = Navigator.getActiveRouteName(state);
        Navigator.routeNameRef.current = currentRouteName;
        console.log('currentRouteName', currentRouteName);
      }}>
      <SafeAreaProvider>
        <MyStack />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

export default App;
