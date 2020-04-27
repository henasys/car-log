import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';

import TripItem from '../view/tripItem';

const hiddenButtonWidth = 75;

export default function TripList({
  list,
  realm,
  transform = null,
  onLoadPreviousList = null,
  onRefreshList = null,
  onDeleteRow = null,
  onSetList = null,
}) {
  const rowBackStyle = transform
    ? {...styles.rowBack, ...{transform: [{scaleY: -1}]}}
    : styles.rowBack;
  const renderHiddenItem = (data, rowMap) => (
    <View style={rowBackStyle}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => deleteRow(rowMap, data.item.id)}>
        <Text style={styles.backTextWhite}>삭제</Text>
      </TouchableOpacity>
    </View>
  );
  const onRowDidOpen = rowKey => {
    console.log('This row opened', rowKey);
  };
  const closeRow = (rowMap, rowKey) => {
    // console.log('closeRow');
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };
  const deleteRow = (rowMap, rowKey) => {
    // console.log('deleteRow');
    closeRow(rowMap, rowKey);
    const newData = [...list];
    const prevIndex = list.findIndex(item => item.id === rowKey);
    newData.splice(prevIndex, 1);
    onSetList && onSetList(newData);
    onDeleteRow && onDeleteRow(rowKey);
  };
  if (!list || list.length === 0) {
    return <View />;
  }
  return (
    <View style={styles.container}>
      <SwipeListView
        useFlatList={true}
        data={list}
        renderItem={({item}) => (
          <TripItem item={item} realm={realm} transform={transform} />
        )}
        keyExtractor={item => item.id}
        onEndReached={onLoadPreviousList}
        onRefresh={onRefreshList}
        refreshing={false}
        renderHiddenItem={renderHiddenItem}
        disableRightSwipe
        leftOpenValue={hiddenButtonWidth}
        rightOpenValue={-hiddenButtonWidth}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        onRowDidOpen={onRowDidOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  backTextWhite: {
    color: '#FFF',
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 50,
  },
  rowBack: {
    alignItems: 'center',
    // backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: hiddenButtonWidth,
  },
  backRightBtnLeft: {
    backgroundColor: 'blue',
    right: hiddenButtonWidth,
  },
  backRightBtnRight: {
    backgroundColor: 'crimson',
    right: 0,
  },
});
