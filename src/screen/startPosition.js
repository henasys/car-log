/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {msToTime, timeToDate, timeToWeek, timeToHourMin} from '../module/util';
import {searchStartPositions} from '../module/util';
import inputBox from '../view/inputBox';

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
  const [velocity, setVelocity] = useState('5.0');
  const [period, setPeriod] = useState('10');
  const [gpsError, setGpsError] = useState('500');
  const [list, setList] = useState([]);
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flexDirection: 'row'}}>
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
          </View>
          {inputBox({
            label: 'GPS오차 ≥',
            unitLabel: 'm',
            defaultValue: gpsError,
            onChangeTextHandler: setGpsError,
          })}
        </View>
        <Icon
          iconStyle={styles.menuItem}
          onPress={() => {
            console.log('search', velocity, period);
            Database.open(realm => {
              const logs = Database.getCarLogList(realm);
              const positions = searchStartPositions(
                logs,
                velocity,
                period,
                gpsError,
              );
              setList(positions);
            });
          }}
          name="search"
          type="material"
          size={48}
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
