import React from 'react';
import {StyleSheet, Text, View, FlatList, ToastAndroid} from 'react-native';

import Database from '../module/database';
import {Locator} from '../module/locator';
import {msToTime, timeToDate, timeToHourMin} from '../module/util';

export default class MainScreen extends React.Component {
  state = {
    realm: null,
    list: [],
  };

  locator = Locator.getInstance();

  componentDidMount() {
    console.log('main componentDidMount');
    this.openDatabase();
    this.locator.initLocator(this.handleOnLocation.bind(this));
    this.locator.getCurrentPosition(position => {
      const coords = position && position.coords;
      if (!coords) {
        return;
      }
      const msg = `init: ${coords.latitude}, ${coords.longitude}`;
      this.showToast(msg);
    });
  }

  componentWillUnmount() {
    console.log('main componentWillUnmount');
    this.closeDatabase();
    this.locator.removeLocator();
  }

  openDatabase() {
    Database.open(realm => {
      this.setState({realm});
      this.getLatestLocation();
      this.getSetting();
      this.getList();
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
  }

  getSetting() {
    const setting = Database.getSetting(this.state.realm);
    this.setting = setting;
  }

  getLatestLocation() {
    const logs = Database.getCarLogList(this.state.realm).sorted(
      'created',
      true,
    );
    this.latestLocation = logs.slice(0, 1);
  }

  getList() {
    const list = Database.getPositionList(this.state.realm);
    this.setState({list});
  }

  showToast(msg) {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }

  handleOnLocation(position) {
    const coords = position && position.coords;
    if (!coords) {
      return;
    }
    Database.saveCarLog(
      this.state.realm,
      coords.latitude,
      coords.longitude,
      position.timestamp,
    )
      .then(log => {
        console.log('saveCarLog done', log);
        this.getList();
        const msg = `new: ${coords.latitude}, ${coords.longitude}`;
        this.showToast(msg);
        const updater = this.locator.getUpdater();
        updater.next(coords);
      })
      .catch(e => {
        console.log('saveCarLog', e);
      });
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
        </View>
      </View>
    );
  }

  render() {
    return (
      <FlatList
        data={this.state.list}
        renderItem={({item}) => this.renderItem(item)}
        keyExtractor={(item, index) => String(index)}
      />
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
});
