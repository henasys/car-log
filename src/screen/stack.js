import React from 'react';
import {View, StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {Icon} from 'react-native-elements';

import MainScreen from '../screen/main';
import LocationScreen from '../screen/location';
import ShareScreen from '../screen/share';
import SettingScreen from '../screen/setting';
import SearchScreen from '../screen/search';
import DeleteScreen from '../screen/delete';
import TripScreen from '../screen/trip';
import Basic from '../screen/swipeTest';
import Example from '../screen/swipeable';

const Stack = createStackNavigator();

const debugView = navigation => {
  return __DEV__ === true ? (
    <View style={styles.menuContainer}>
      <Icon
        iconStyle={styles.menuItem}
        onPress={() => navigation.navigate('SwipeTest')}
        name="bug"
        type="material-community"
      />
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
        onPress={() => navigation.navigate('Trip')}
        name="playlist-edit"
        type="material-community"
      />
    </View>
  ) : (
    <View />
  );
};

export default function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={({navigation, route}) => ({
          title: '운행 자동 기록',
          headerRight: () => (
            <View style={styles.menuContainer}>
              {debugView(navigation)}
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
          headerRight: () => (
            <View style={styles.menuContainer}>
              <Icon
                iconStyle={styles.menuItem}
                onPress={() => navigation.navigate('Delete')}
                name="delete-forever"
                type="material"
              />
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="Delete"
        component={DeleteScreen}
        options={{title: '기록 삭제'}}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={({navigation, route}) => ({
          title: '출발점 검출',
        })}
      />
      <Stack.Screen
        name="Location"
        component={LocationScreen}
        options={({navigation, route}) => ({
          title: '위치 정보',
        })}
      />
      <Stack.Screen
        name="Trip"
        component={TripScreen}
        options={({navigation, route}) => ({
          title: '운행 기록 편집',
        })}
      />
      <Stack.Screen
        name="SwipeTest"
        component={Example}
        options={({navigation, route}) => ({
          title: 'Swipe Test',
        })}
      />
    </Stack.Navigator>
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
