import React from 'react';
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
  const deleteRow = rowKey => {
    console.log('deleteRow', rowKey);
    if (!rowKey) {
      return;
    }
    const newData = [...list];
    const prevIndex = list.findIndex(item => item.id === rowKey);
    newData.splice(prevIndex, 1);
    onSetList && onSetList(newData);
    onDeleteRow && onDeleteRow(rowKey);
  };
  if (list.length === 0) {
    return <View />;
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({item}) => (
          <SwipeableRow
            rowKey={item.id}
            deleteRow={deleteRow}
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
