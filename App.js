import 'react-native-gesture-handler';
import * as React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';

import RootNavigator from './src/module/rootNavigator';
import MyStack from './src/screen/stack';

function App() {
  React.useEffect(() => {
    RootNavigator.isMountedRef.current = true;
    // if (RootNavigator.navigationRef.current) {
    const state = RootNavigator.navigationRef.current.getRootState();
    console.log('init state', state);
    RootNavigator.routeNameRef.current = RootNavigator.getActiveRouteName(
      state,
    );
    // }
    return () => (RootNavigator.isMountedRef.current = false);
  }, []);
  return (
    <NavigationContainer
      ref={RootNavigator.navigationRef}
      onStateChange={state => {
        console.log('New state is', state);
        const currentRouteName = RootNavigator.getActiveRouteName(state);
        RootNavigator.routeNameRef.current = currentRouteName;
        console.log('currentRouteName', currentRouteName);
      }}>
      <SafeAreaProvider>
        <MyStack />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

export default App;
