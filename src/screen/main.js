import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';

import Database from '../module/database';
import {Locator} from '../module/locator';
import {timeToWeek, timeToDate, timeToHourMin, timeToMonthDay} from '../module/util';
import {timeToDateHourMin, toFixed} from '../module/util';
import {toast} from '../module/toast';

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
    const callback = position => {
      const coords = position && position.coords;
      if (!coords) {
        return;
      }
      const msg = `init: ${coords.latitude}, ${coords.longitude}`;
      toast(msg);
    };
    const errorCallback = error => {
      const msg = `${error.code}: ${error.message}`;
      toast(msg);
    };
    this.locator.getCurrentPosition(callback, errorCallback);
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
      // this.getCarLogList();
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
    const list = Database.getPositionList(this.state.realm).sorted('created');
    console.log('list', list);
    this.setState({list});
  }

  getCarLogList() {
    const list = Database.getCarLogList(this.state.realm);
    list.forEach(log => {
      log.date = timeToDateHourMin(log.created);
      console.log(log);
    });
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
      coords.speed,
      coords.heading,
      coords.accuracy,
      position.timestamp,
    )
      .then(log => {
        console.log('saveCarLog done', log);
        this.getList();
        const msg = `new: ${coords.latitude}, ${coords.longitude}`;
        toast(msg);
        const updater = this.locator.getUpdater();
        updater.next(coords);
      })
      .catch(e => {
        console.log('saveCarLog', e);
      });
  }

  renderItem(item) {
    const distance = item.distance === 0 ? '' : toFixed(item.distance / 1000) + ' km';
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemColumnContainer}>
          <Text>{timeToMonthDay(item.created)}</Text>
          <Text>{timeToWeek(item.created)}</Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text>
            {Database.Position.getTypeIndex(item.type).label}{' '}
            {timeToHourMin(item.created)}
          </Text>
          <Text>
            좌표: {toFixed(item.latitude)}, {toFixed(item.longitude)}
          </Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text>{distance}</Text>
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
    justifyContent: 'space-between',
    margin: 10,
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
});
