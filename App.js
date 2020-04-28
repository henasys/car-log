import 'react-native-gesture-handler';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';

import MyStack from './src/screen/stack';

function App() {
  const ref = React.useRef(null);
  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={ref}
        onStateChange={state => {
          // console.log('New state is', state);
        }}>
        <MyStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
