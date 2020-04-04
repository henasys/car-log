/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {msToTime, timeToDate, timeToWeek, timeToHourMin} from '../module/util';
import {toFixed} from '../module/util';
import inputBox from '../view/inputBox';
import {TripDetector} from '../module/detector';

const renderItem = item => {
  return (
    <View style={styles.itemContainer}>
      <View style={[styles.itemColumnContainer, {alignItems: 'center'}]}>
        <Text>{timeToDate(item.created)}</Text>
        <Text>{timeToWeek(item.created)}</Text>
        <Text>{timeToHourMin(item.created)}</Text>
      </View>
      <View style={styles.itemColumnContainer}>
        <Text>
          {item.type} {item.number}
        </Text>
        <Text>시간간격: {msToTime(item.totalTime)}</Text>
        <Text>거리합산: {toFixed(item.totalDistance / 1000)} km</Text>
        <Text>
          좌표: {toFixed(item.latitude, 4)}, {toFixed(item.longitude, 4)}
        </Text>
      </View>
    </View>
  );
};

export function SearchScreen(props) {
  const [accuracyMargin, setAccuracyMargin] = useState('40');
  const [period, setPeriod] = useState('30');
  const [radiusOfArea, setRadiusOfArea] = useState('300');
  const [list, setList] = useState([]);
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
              // console.log(result);
              props.navigation.setParams({result: result});
              setList(result);
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
