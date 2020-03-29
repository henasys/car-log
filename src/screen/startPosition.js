/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {msToTime, timeToDate, timeToWeek, timeToHourMin} from '../module/util';
import inputBox from '../view/inputBox';

const searchStartPositions = (realm, velocity, period, setList) => {
  const floatVelocity = parseFloat(velocity);
  const intPeriod = parseInt(period, 10);
  console.log('intPeroid', intPeriod);
  if (isNaN(floatVelocity)) {
    console.warn('velocity is not number');
    return;
  }
  if (isNaN(intPeriod)) {
    console.warn('peroid is not number');
    return;
  }
  const periodInMil = intPeriod * 60 * 1000;
  const list = Database.getCarLogList(realm);
  // console.log('list', list);
  let prevTime = 0;
  let prevLatitude = 0;
  let prevLongitude = 0;
  const calculated = [];
  list.forEach((log, index) => {
    log.dt = log.created - prevTime;
    const dx = log.latitude - prevLatitude;
    const dy = log.longitude - prevLongitude;
    const dd = 100000 * Math.hypot(dx, dy);
    const vc = (1000 * dd) / log.dt;
    log.vc = vc.toFixed(3);
    log.dd = dd.toFixed(0);
    if (vc <= floatVelocity) {
      if (log.dt >= periodInMil) {
        console.log('Found start position', index);
        console.log('vc', log.vc, 'dd', log.dd);
        console.log('dt', msToTime(log.dt));
        console.log('created', timeToDate(log.created));
        console.log('log', log);
        calculated.push(log);
      }
    }
    prevTime = log.created;
    prevLatitude = log.latitude;
    prevLongitude = log.longitude;
  });
  setList(calculated);
};

const renderItem = item => {
  return (
    <View style={styles.itemContainer}>
      <View style={[styles.itemColumnContainer, {alignItems: 'center'}]}>
        <Text>{timeToDate(item.created)}</Text>
        <Text>{timeToWeek(item.created)}</Text>
        <Text>{timeToHourMin(item.created)}</Text>
      </View>
      <View style={styles.itemColumnContainer}>
        <Text>간격: {msToTime(item.dt)}</Text>
        <Text>
          속도: {item.vc} [{item.dd}m / {(item.dt / 1000).toFixed(0)}s]
        </Text>
        <Text>
          좌표: {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

export function StartPositionScreen(props) {
  const [velocity, setVelocity] = useState('1.0');
  const [period, setPeriod] = useState('10');
  const [list, setList] = useState([]);
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {inputBox({
          label: '속도 ≤',
          unitLabel: 'm/s',
          defaultValue: velocity,
          onChangeTextHandler: setVelocity,
        })}
        {inputBox({
          label: '시간 ≥',
          unitLabel: 'min',
          defaultValue: period,
          onChangeTextHandler: setPeriod,
        })}
        <Icon
          iconStyle={styles.menuItem}
          onPress={() => {
            console.log('search', velocity, period);
            Database.open(realm => {
              searchStartPositions(realm, velocity, period, setList);
            });
          }}
          name="search"
          type="material"
        />
      </View>
      <FlatList
        data={list}
        renderItem={({item}) => renderItem(item)}
        keyExtractor={(item, index) => String(index)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
});
