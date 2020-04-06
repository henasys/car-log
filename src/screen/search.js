/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {msToTime, timeToDate, timeToWeek, timeToHourMin} from '../module/util';
import {toFixed} from '../module/util';
import inputBox from '../view/inputBox';
import {TripDetector} from '../module/detector';

const renderItem = item => {
  const endBlock = item.end && (
    <View>
      <Text>
        도착: {timeToDate(item.end.created)} {timeToHourMin(item.end.created)}
      </Text>
      <Text>
        {'  '} 좌표: {toFixed(item.end.latitude, 4)},{' '}
        {toFixed(item.end.longitude, 4)}
      </Text>
      <Text>시간간격: {msToTime(item.end.totalTime)}</Text>
      <Text>거리합산: {toFixed(item.end.totalDistance / 1000)} km</Text>
    </View>
  );
  return (
    <View style={styles.itemContainer}>
      <View style={[styles.itemColumnContainer, {alignItems: 'center'}]}>
        <Text>{timeToDate(item.start.created)}</Text>
        <Text>{timeToWeek(item.start.created)}</Text>
      </View>
      <View style={styles.itemColumnContainer}>
        <Text>{item.number}</Text>
        <Text>출발: {timeToHourMin(item.start.created)}</Text>
        <Text>
          {'  '} 좌표: {toFixed(item.start.latitude, 4)},{' '}
          {toFixed(item.start.longitude, 4)}
        </Text>
        {endBlock}
      </View>
    </View>
  );
};

export function SearchScreen(props) {
  const [accuracyMargin, setAccuracyMargin] = useState('0');
  const [period, setPeriod] = useState('0');
  const [radiusOfArea, setRadiusOfArea] = useState('0');
  const [list, setList] = useState([]);
  const initStates = () => {
    console.log('initStates');
    Database.open(realm => {
      const setting = Database.getSetting(realm);
      setPeriod(String(setting.period));
      setAccuracyMargin(String(setting.accuracyMargin));
      setRadiusOfArea(String(setting.radiusOfArea));
    });
  };
  const doSearch = () => {
    const speedMargin = 0.0;
    Database.open(realm => {
      const locations = Database.getLocationList(realm);
      const detector = new TripDetector(
        period,
        accuracyMargin,
        radiusOfArea,
        speedMargin,
      );
      detector.detectList(locations);
      const result = detector.getResult();
      console.log('result', result);
      props.navigation.setParams({result: result});
      setList(result);
    });
  };
  useEffect(() => {
    initStates();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flexDirection: 'row'}}>
            {inputBox({
              label: '영역반경 ≤',
              unitLabel: 'm',
              defaultValue: radiusOfArea,
              onChangeTextHandler: setRadiusOfArea,
            })}
            {inputBox({
              label: '정차시간 ≥',
              unitLabel: 'min',
              defaultValue: period,
              onChangeTextHandler: setPeriod,
            })}
          </View>
          {inputBox({
            label: 'GPS 정확도 ≤',
            unitLabel: 'm',
            defaultValue: accuracyMargin,
            onChangeTextHandler: setAccuracyMargin,
          })}
        </View>
        <Icon
          iconStyle={styles.menuItem}
          onPress={() => {
            console.log('search');
            doSearch();
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
