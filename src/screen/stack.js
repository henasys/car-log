import React from 'react';
import {View, StyleSheet, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import LocationScreen from '../screen/location';
import {ShareScreen} from '../screen/share';
import {SettingScreen} from '../screen/setting';

const Stack = createStackNavigator();

export default function MyStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={LocationScreen}
          options={({navigation, route}) => ({
            title: '운행일지',
            headerRight: () => (
              <View style={styles.menuContainer}>
                <Button
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('Share')}
                  title="Share"
                  color="#000"
                />
                <View style={{marginHorizontal: 10}} />
                <Button
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('Setting')}
                  title="Setting"
                  color="#000"
                />
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="Share"
          component={ShareScreen}
          options={{title: '메일 전송'}}
        />
        <Stack.Screen
          name="Setting"
          component={SettingScreen}
          options={{title: '설정'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  menuItem: {
    marginHorizontal: 10,
  },
});
