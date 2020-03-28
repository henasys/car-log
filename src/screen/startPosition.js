import React, {Component, useState} from 'react';
import {Text, View, StyleSheet, TextInput} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {msToTime} from '../module/util';

const inputBox = (label, unitLabel, defaultValue, onChangeTextHandler) => {
  return (
    <View style={styles.inputBoxContainer}>
      <Text style={styles.textInputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={text => onChangeTextHandler(text)}
        defaultValue={defaultValue}
      />
      <Text>{unitLabel}</Text>
    </View>
  );
};

const searchStartPositions = (velocity, period) => {
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
  Database.getCarLogList()
    .then(list => {
      // console.log('list', list);
      let prevTime = 0;
      let prevLatitude = 0;
      let prevLongitude = 0;
      list.forEach((log, index) => {
        log.dt = log.created - prevTime;
        const dx = log.latitude - prevLatitude;
        const dy = log.longitude - prevLongitude;
        const dd = 100000 * Math.hypot(dx, dy);
        const vc = (1000 * dd) / log.dt;
        log.vc = vc.toFixed(2);
        log.dd = dd.toFixed(0);
        if (vc <= floatVelocity) {
          if (log.dt >= periodInMil) {
            console.log('Found start position', index);
            console.log('vc', log.vc, 'dd', log.dd);
            console.log('dt', msToTime(log.dt));
            console.log('created', new Date(log.created).toLocaleString());
            console.log('log', log);
          }
        }
        prevTime = log.created;
        prevLatitude = log.latitude;
        prevLongitude = log.longitude;
      });
    })
    .catch(e => {
      console.log(e);
    });
};

export function StartPositionScreen() {
  const [velocity, setVelocity] = useState('1.0');
  const [period, setPeriod] = useState('10');
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {inputBox('속도 <', 'm/s', velocity, setVelocity)}
        {inputBox('시간 <', 'min', period, setPeriod)}
        <Icon
          iconStyle={styles.menuItem}
          onPress={() => {
            console.log('search', velocity, period);
            searchStartPositions(velocity, period);
          }}
          name="search"
          type="material"
        />
      </View>
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
  inputBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  textInputLabel: {
    fontSize: 16,
  },
  textInput: {
    height: 40,
    width: 40,
    borderWidth: 1,
    marginHorizontal: 10,
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
