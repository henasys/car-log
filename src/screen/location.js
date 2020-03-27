import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import Database from '../module/database';

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
        console.log('list', list);
        this.setState({list});
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
    if (!coords.speed || coords.speed < 1) {
      return;
    }
    Database.saveCarLog(coords.latitude, coords.longitude, position.timestamp)
      .then(log => {
        console.log('saveCarLog done', log);
      })
      .catch(e => {
        console.log('saveCarLog', e);
      });
  }

  renderItem(item) {
    return (
      <View style={styles.itemContainer}>
        <Text>latitude: {item.latitude}</Text>
        <Text>longitude: {item.longitude}</Text>
        <Text>created: {new Date(item.created).toLocaleString()}</Text>
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
    flexDirection: 'column',
    margin: 10,
  },
});
