import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';

import TripItem from '../view/tripItem';

const onRowDidOpen = rowKey => {
  console.log('This row opened', rowKey);
};

const closeRow = (rowMap, rowKey) => {
  console.log('closeRow');
  if (rowMap[rowKey]) {
    rowMap[rowKey].closeRow();
  }
};

const deleteRow = (rowMap, rowKey) => {
  console.log('deleteRow');
  this.closeRow(rowMap, rowKey);
  // const newData = [...listData];
  // const prevIndex = listData.findIndex(item => item.key === rowKey);
  // newData.splice(prevIndex, 1);
  // this.setListData(newData);
};

export default function TripList({
  list,
  realm,
  transform = null,
  onLoadPreviousList = null,
  onRefreshList = null,
}) {
  const rowBackStyle = transform
    ? {...styles.rowBack, ...{transform: [{scaleY: -1}]}}
    : styles.rowBack;
  const renderHiddenItem = (data, rowMap) => (
    <View style={rowBackStyle}>
      <Text>Left</Text>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => closeRow(rowMap, data.item.id)}>
        <Text style={styles.backTextWhite}>닫기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => deleteRow(rowMap, data.item.id)}>
        <Text style={styles.backTextWhite}>삭제</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <SwipeListView
        useFlatList={true}
        data={list}
        renderItem={({item}) => (
          <TripItem item={item} realm={realm} transform={transform} />
        )}
        keyExtractor={(item, index) => item.id}
        onEndReached={onLoadPreviousList}
        onRefresh={onRefreshList}
        refreshing={false}
        renderHiddenItem={renderHiddenItem}
        leftOpenValue={75}
        rightOpenValue={-150}
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
    backgroundColor: '#DDD',
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
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: 'blue',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
});
