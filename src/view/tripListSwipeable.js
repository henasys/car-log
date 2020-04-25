import React from 'react';
import {View, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import SwipeableRow from '../view/swipeableRow';
import TripItem from './tripItem';
import MyAlert from '../view/alert';
import {getDetailDataRow} from '../module/bundleData';

export default function TripList({
  list,
  realm,
  transform = null,
  onLoadPreviousList = null,
  onRefreshList = null,
  onDeleteRow = null,
  onSetList = null,
  onMergeRow = null,
}) {
  const _onDeleteRow = rowKey => {
    console.log('_onDeleteRow', rowKey);
    if (!rowKey) {
      return;
    }
    const newData = [...list];
    const prevIndex = list.findIndex(item => item.id === rowKey);
    newData.splice(prevIndex, 1);
    onSetList && onSetList(newData);
    onDeleteRow && onDeleteRow(rowKey);
  };
  const _onMergeRow = (rowKey, rowIndex) => {
    console.log('onMergeRow', rowKey, rowIndex);
    const trip = list[rowIndex];
    const next = list[rowIndex - 1];
    const tripData = getDetailDataRow(trip);
    const title = `운행기록 합치기: ${tripData.date}`;
    if (!next) {
      const message = '합치기에 필요한 다음 항목이 없습니다.';
      MyAlert.showAlert(title, message);
      return;
    }
    const nextData = getDetailDataRow(next);
    const messages = [];
    messages.push(
      `선택: ${tripData.startHour} -> ${tripData.endHour} ${
        tripData.distance
      } km`,
    );
    messages.push(
      `다음: ${nextData.startHour} -> ${nextData.endHour} ${
        nextData.distance
      } km`,
    );
    const okCallback = () => {
      onMergeRow && onMergeRow(rowKey, rowIndex);
    };
    const cancelCallback = () => {};
    MyAlert.showTwoButtonAlert(
      title,
      messages.join('\n'),
      okCallback,
      cancelCallback,
    );
  };
  const onSwipeableLeftOpen = () => {
    // console.log('onSwipeableLeftOpen', rowKey, rowIndex);
  };
  const onSwipeableClose = () => {
    // console.log('onSwipeableClose', rowKey, rowIndex);
  };
  if (list.length === 0) {
    return <View />;
  }
  console.log('TripList render');
  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({item, index}) => (
          <SwipeableRow
            rowKey={item.id}
            rowIndex={index}
            rowItem={item}
            onDeleteRow={_onDeleteRow}
            onSwipeableLeftOpen={onSwipeableLeftOpen}
            onSwipeableClose={onSwipeableClose}
            onMergeRow={_onMergeRow}
            transform={transform}>
            <TripItem item={item} realm={realm} transform={transform} />
          </SwipeableRow>
        )}
        keyExtractor={item => item.id}
        onEndReached={onLoadPreviousList}
        onRefresh={onRefreshList}
        refreshing={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  separator: {
    backgroundColor: 'rgb(200, 199, 204)',
    height: StyleSheet.hairlineWidth,
  },
});
