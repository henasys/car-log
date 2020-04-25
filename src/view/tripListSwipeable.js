import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import SwipeableRow from '../view/swipeableRow';
import TripItem from './tripItem';

export default function TripList({
  list,
  realm,
  transform = null,
  onLoadPreviousList = null,
  onRefreshList = null,
  onDeleteRow = null,
  onSetList = null,
}) {
  const [mergeStart, setMergeStart] = useState(null);
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
  const onSwipeableLeftOpen = (rowKey, rowIndex) => {
    console.log('onSwipeableLeftOpen', rowKey, rowIndex);
    if (mergeStart) {
      const deltaIndex = Math.abs(mergeStart.rowIndex - rowIndex);
      if (deltaIndex === 1) {
        console.log('exactly adjacent item');
        mergeStart.item.adjacent = true;
        return;
      }
    }
    setMergeStart({rowIndex, rowKey, item: list[rowIndex]});
  };
  const onSwipeableClose = (rowKey, rowIndex) => {
    console.log('onSwipeableClose', rowKey, rowIndex);
    if (mergeStart) {
      if (mergeStart.rowIndex === rowIndex) {
        setMergeStart(null);
      }
    }
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
            onDeleteRow={_onDeleteRow}
            onSwipeableLeftOpen={onSwipeableLeftOpen}
            onSwipeableClose={onSwipeableClose}
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
