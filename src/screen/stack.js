import React from 'react';
import {View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Icon} from 'react-native-elements';

import MainScreen from '../screen/main';
import LocationScreen from '../screen/location';
import {ShareScreen} from '../screen/share';
import SettingScreen from '../screen/setting';
import {SearchScreen} from './search';

const Stack = createStackNavigator();

export default function MyStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={({navigation, route}) => ({
            title: '운행일지',
            headerRight: () => (
              <View style={styles.menuContainer}>
                <Icon
                  iconStyle={styles.menuItem}
                  onPress={() => navigation.navigate('Location')}
                  name="location-pin"
                  type="entypo"
                />
                <Icon
                  iconStyle={styles.menuItem}
                  onPress={() => navigation.navigate('Search')}
                  name="search"
                  type="material"
                />
                <Icon
                  iconStyle={styles.menuItem}
                  onPress={() => navigation.navigate('Share')}
                  name="share"
                  type="material"
                />
                <Icon
                  iconStyle={styles.menuItem}
                  onPress={() => navigation.navigate('Setting')}
                  name="settings"
                  type="material"
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
          options={({navigation}) => ({
            title: '설정',
            headerRight: () => <View style={styles.menuContainer} />,
          })}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{title: '출발/도착지 검출'}}
        />
        <Stack.Screen
          name="Location"
          component={LocationScreen}
          options={{title: '운행 기록'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
  },
  menuItem: {
    marginRight: 10,
  },
});
