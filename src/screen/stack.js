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

import Database from '../module/database';
import database from '../module/database';

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
          options={({navigation, route}) => ({
            title: '설정',
            headerRight: () => <View style={styles.menuContainer} />,
          })}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={({navigation, route}) => ({
            title: '출발/도착지 검출',
            headerRight: () => (
              <View style={styles.menuContainer}>
                <Icon
                  iconStyle={styles.menuItem}
                  onPress={() => {
                    doSaveTrips(route);
                  }}
                  name="save"
                  type="material"
                />
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="Location"
          component={LocationScreen}
          options={({navigation, route}) => ({
            title: '운행 기록',
            headerRight: () => (
              <View style={styles.menuContainer}>
                <Icon
                  iconStyle={styles.menuItem}
                  onPress={() => {
                    console.log('route', route);
                    doSaveCarLogs(navigation, route);
                  }}
                  name="save"
                  type="material"
                />
              </View>
            ),
          })}
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

function doSaveTrips(route) {
  console.log('route', route);
  const result = route.params && route.params.result;
  console.log('save', result);
  Database.open(realm => {
    result.forEach(log => {
      database
        .savePosition(
          realm,
          log.latitude,
          log.longitude,
          log.type,
          log.totalDistance,
          log.created,
        )
        .then(position => {
          console.log('savePosition done');
        })
        .catch(e => {
          console.log('savePosition error', e);
        });
    });
  });
}

// import {carLogs} from './car_log_data_room.js';

function doSaveCarLogs(navigation, route) {
  // console.log('carLogs.length', carLogs.length);
  // Database.open(realm => {
  //   carLogs.forEach(log => {
  //     Database.saveCarLog(
  //       realm,
  //       log.latitude,
  //       log.longitude,
  //       log.speed,
  //       log.heading,
  //       log.accuracy,
  //       log.created,
  //     )
  //       .then(carLog => {
  //         console.log('saveCarLog done', carLog.created);
  //       })
  //       .catch(e => {
  //         console.log('saveCarLog', e);
  //       });
  //   });
  // });
}
