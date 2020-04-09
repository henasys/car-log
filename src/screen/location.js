import React from 'react';
import {StyleSheet, Text, View, FlatList, SafeAreaView} from 'react-native';

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
    // this.addLocatorUpdater();
    this.setDatabase();
    // this.openDatabase();
  }

  componentWillUnmount() {
    console.log('location componentWillUnmount');
    // this.removeLocatorUpdater();
    // this.closeDatabase();
  }

  setDatabase() {
    const realm = Database.getRealm();
    console.log('realm', realm.schemaVersion);
    this.setState({realm});
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
    console.log('getList', startIndex);
    if (this.state.realm === null) {
      return [];
    }
    const list = Database.getLocationList(this.state.realm).sorted(
      'created',
      true,
    );
    // const reversed = Database.getLocationList(this.state.realm).sorted(
    //   'created',
    //   false,
    // );
    // reversed.forEach(location => {
    //   console.log(location);
    // });
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
    const {list} = this.state;
    console.log('location render', list.length);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.ListContainer}>
          <FlatList
            ref={ref => (this.flatList = ref)}
            data={list}
            renderItem={({item}) => this.renderItem(item)}
            keyExtractor={(item, index) => `${item.created}_${index}`}
            onEndReached={this.onLoadPreviousList.bind(this)}
            onRefresh={this.onRefreshList.bind(this)}
            refreshing={false}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
