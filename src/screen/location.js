import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';

import Database from '../module/database';
import {msToTime, timeToDate, timeToHourMin} from '../module/util';

export default class LocationScreen extends React.Component {
  state = {
    realm: null,
    list: [],
  };

  componentDidMount() {
    console.log('location componentDidMount');
    this.openDatabase();
  }

  componentWillUnmount() {
    console.log('location componentWillUnmount');
    this.closeDatabase();
  }

  openDatabase() {
    Database.open(realm => {
      this.setState({realm});
      console.log('realm.open() done');
      this.getList();
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
  }

  getList() {
    const list = Database.getCarLogList(this.state.realm);
    // console.log('list', list);
    let prevTime = 0;
    let prevLatitude = 0;
    let prevLongitude = 0;
    const calculated = [];
    list.forEach((log, index) => {
      log.dt = log.created - prevTime;
      const dx = log.latitude - prevLatitude;
      const dy = log.longitude - prevLongitude;
      const dd = 100000 * Math.hypot(dx, dy);
      const vc = (1000 * dd) / log.dt;
      log.vc = vc.toFixed(2);
      log.dd = dd.toFixed(0);
      calculated.push(log);
      // console.log(log);
      prevTime = log.created;
      prevLatitude = log.latitude;
      prevLongitude = log.longitude;
    });
    this.setState({list: calculated});
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
        ref={ref => (this.flatList = ref)}
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
