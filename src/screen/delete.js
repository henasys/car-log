import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, View, FlatList, Text} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {timeToDateHourMin, configureYearLoop} from '../module/util';

export function DeleteScreen({route, navigation}) {
  const [realm, setRealm] = useState(null);
  const [list, setList] = useState([]);
  const openDatabase = () => {
    Database.open(newRealm => {
      setRealm(newRealm);
      console.log('setRealm() done');
    });
  };
  const closeDatabase = () => {
    Database.close(realm);
  };
  const initStates = () => {
    console.log('initStates');
    if (realm === null) {
      console.log('realm is null');
      return;
    }
    // const list = Database.getTripListByTimestamp(realm, start, end);
    const min = Database.getTripList(realm).min('startCreated');
    console.log('min', min, timeToDateHourMin(min));
    const max = Database.getTripList(realm).max('startCreated');
    console.log('max', max, timeToDateHourMin(max));
    const yearLoop = configureYearLoop(min, max);
    console.log('yearLoop', yearLoop);
    yearLoop.forEach(year => {
      year.data.forEach(item => {
        console.log('item', item);
        const monthList = Database.getTripListByTimestamp(
          realm,
          item.start,
          item.end,
        );
        console.log('count', monthList.length);
        item.count = monthList.length;
      });
    });
  };
  useEffect(() => {
    console.log('delete useEffect start');
    openDatabase();
    return () => {
      console.log('delete useEffect cleanup');
      closeDatabase();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    initStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm]);
  const renderItem = item => {};
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        renderItem={({item}) => renderItem(item)}
        keyExtractor={(item, index) => String(index)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputBoxContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  textInput: {
    // height: 40,
    width: '100%',
    borderWidth: 0.5,
    borderColor: 'grey',
    marginHorizontal: 10,
    padding: 10,
  },
});
