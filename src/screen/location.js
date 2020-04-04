import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';

import Database from '../module/database';
import {Locator} from '../module/locator';
import {msToTime, timeToDate, timeToHourMin} from '../module/util';
import {calculateLocationList, fixLastLocation} from '../module/util';

const NUMBERS_PER_PAGE = 50;

export default class LocationScreen extends React.Component {
  state = {
    realm: null,
    list: [],
  };

  pagingStartIndex = 0;
  locator = Locator.getInstance();

  componentDidMount() {
    console.log('location componentDidMount');
    this.addLocatorUpdater();
    this.openDatabase();
  }

  componentWillUnmount() {
    console.log('location componentWillUnmount');
    this.removeLocatorUpdater();
    this.closeDatabase();
  }

  openDatabase() {
    Database.open(realm => {
      this.setState({realm});
      this.initList();
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
  }

  addLocatorUpdater() {
    this.locatorUpdater = Locator.getInstance()
      .getUpdater()
      .subscribe({
        next: payload => {
          console.log('Locator updater observer', payload);
          this.initList();
        },
      });
  }

  removeLocatorUpdater() {
    this.locatorUpdater && this.locatorUpdater.unsubscribe();
  }

  initList() {
    this.pagingStartIndex = 0;
    const list = this.getList(this.pagingStartIndex);
    // console.log('list', list);
    this.setState({list});
  }

  onLoadPreviousList() {
    console.log('onLoadPreviousList', this.pagingStartIndex);
    const logs = this.getList(this.pagingStartIndex + NUMBERS_PER_PAGE);
    if (logs.length !== 0) {
      this.pagingStartIndex += NUMBERS_PER_PAGE;
      const {list} = this.state;
      fixLastLocation(list, logs[0]);
      this.setState({list: list.concat(logs)});
    }
  }

  onRefreshList() {
    console.log('onRefreshList');
    this.initList();
  }

  getList(startIndex) {
    const list = Database.getLocationList(this.state.realm).sorted(
      'created',
      true,
    );
    const sliced = list.slice(startIndex, startIndex + NUMBERS_PER_PAGE);
    // console.log('getList', sliced);
    return calculateLocationList(sliced);
  }

  renderItem(item) {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemColumnContainer}>
          <Text>dd: {item.dd}</Text>
          <Text>dt: {msToTime(item.dt)}</Text>
          <Text>vc: {item.vc}</Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text>latitude: {item.latitude}</Text>
          <Text>longitude: {item.longitude}</Text>
          <Text>
            created: {timeToDate(item.created)} {timeToHourMin(item.created)}
          </Text>
          <Text>speed: {item.speed}</Text>
          <Text>heading: {item.heading}</Text>
          <Text>accuracy: {item.accuracy}</Text>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.ListContainer}>
        <FlatList
          ref={ref => (this.flatList = ref)}
          data={this.state.list}
          renderItem={({item}) => this.renderItem(item)}
          keyExtractor={(item, index) => `${item.created}_${index}`}
          onEndReached={this.onLoadPreviousList.bind(this)}
          onRefresh={this.onRefreshList.bind(this)}
          refreshing={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    margin: 10,
    transform: [{scaleY: -1}],
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  ListContainer: {
    flex: 1,
    padding: 0,
    margin: 0,
    transform: [{scaleY: -1}],
  },
});
