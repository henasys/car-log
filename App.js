import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useBackButton} from '@react-navigation/native';

import MyStack from './src/screen/stack';

function App() {
  const ref = React.useRef(null);
  useBackButton(ref);
  return (
    <NavigationContainer
      ref={ref}
      onStateChange={state => {
        console.log('New state is', state);
      }}>
      <MyStack />
    </NavigationContainer>
  );
}

export default App;
