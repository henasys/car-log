/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {msToTime, timeToDate, timeToWeek, timeToHourMin} from '../module/util';
import {detectEdgePoints, toFixed} from '../module/util';
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
        <Text>{item.type}</Text>
        <Text>시간간격: {msToTime(item.dt)}</Text>
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
  const [radiusOfArea, setRadiusOfArea] = useState('100');
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
            Database.open(realm => {
              const logs = Database.getCarLogList(realm);
              const result = detectEdgePoints(
                logs,
                period,
                accuracyMargin,
                radiusOfArea,
              );
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
