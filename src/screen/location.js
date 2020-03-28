import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import Database from '../module/database';

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100)
      , seconds = parseInt((duration / 1000) % 60)
      , minutes = parseInt((duration / (1000 * 60)) % 60)
      , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  //return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  return hours + ":" + minutes + ":" + seconds;
}

export default class LocationScreen extends React.Component {
  state = {
    list: [],
  };

  componentDidMount() {
    console.log('location componentDidMount');
    this.getList();
    this.initLocator();
  }

  componentWillUnmount() {
    console.log('location componentWillUnmount');
    this.removeLocator();
  }

  getList() {
    Database.getCarLogList()
      .then(list => {
        // console.log('list', list);
        let prevTime = 0;
        let prevLatitude = 0;
        let prevLongitude = 0;
        let maxDistance = 0;
        let maxTime = 0;
        const calculated = [];
        list.forEach((log, index) => {
          log.dt = log.created - prevTime;
          const dx = log.latitude - prevLatitude;
          const dy = log.longitude - prevLongitude;
          const dd = 100000 * Math.hypot(dx, dy);
          const vc = (1000 * dd) / log.dt;
          log.vc = vc.toFixed(2);
          log.dd = dd.toFixed(0);
          if (index < 3) {
            console.log(log);
          }
          calculated.push(log);
          if (prevTime > 0) {
            if (maxDistance < log.dd) {
              maxDistance = log.dd;
            }
            if (maxTime < log.dt) {
              maxTime = log.dt;
            }
          }
          prevTime = log.created;
          prevLatitude = log.latitude;
          prevLongitude = log.longitude;
        });
        console.log('maxDistance', maxDistance);
        console.log('maxTime', maxTime, msToTime(maxTime));
        this.setState({list: calculated});
      })
      .catch(e => {
        console.log(e);
      });
  }

  initLocator() {
    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000,
    };
    Geolocation.getCurrentPosition(
      position => {
        console.log('initPosition', position);
        this.initPosition = position;
      },
      error => console.log('getCurrentPosition Error', error),
      options,
    );
    this.watchID = Geolocation.watchPosition(
      position => {
        console.log('lastPosition', position);
        this.handleOnLocation(position);
      },
      error => console.log('getCurrentPosition Error', error),
      options,
    );
  }

  removeLocator() {
    this.watchID != null && Geolocation.clearWatch(this.watchID);
  }

  handleOnLocation(position) {
    const coords = position && position.coords;
    if (!coords) {
      return;
    }
    Database.saveCarLog(coords.latitude, coords.longitude, position.timestamp)
      .then(log => {
        console.log('saveCarLog done', log);
        this.getList();
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
          <Text>created: {new Date(item.created).toLocaleString()}</Text>
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
