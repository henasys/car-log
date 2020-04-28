import 'react-native-gesture-handler';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';

import RootNavigator from './src/module/rootNavigator';
import MyStack from './src/screen/stack';

function App() {
  React.useEffect(() => {
    RootNavigator.isMountedRef.current = true;
    const state = RootNavigator.navigationRef.current?.getRootState();
    console.log('init state', state);
    RootNavigator.routeNameRef.current = RootNavigator.getActiveRouteName(
      state,
    );
    return () => (RootNavigator.isMountedRef.current = false);
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={RootNavigator.navigationRef}
        onStateChange={state => {
          console.log('New state is', state);
          const currentRouteName = RootNavigator.getActiveRouteName(state);
          RootNavigator.routeNameRef.current = currentRouteName;
          console.log('currentRouteName', currentRouteName);
        }}>
        <MyStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
