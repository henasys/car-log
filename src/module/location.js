import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import {DatabaseManager} from '../module/realm';

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
    const db = DatabaseManager.getInstance();
    console.log('db', db);
    const list = db.getCarLogList();
    console.log('list.isEmpty', list.isEmpty());
    console.log('list.isValid', list.isValid());
    console.log('list', list);
    this.setState({list});
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
      error => console.log('Error', error),
      options,
    );
    this.watchID = Geolocation.watchPosition(position => {
      console.log('lastPosition', position);
      const coords = position && position.coords;
      if (!coords) {
        return;
      }
      const db = DatabaseManager.getInstance();
      console.log('db', db);
      const list = db.getCarLogList();
      console.log('list.isEmpty', list.isEmpty());
      console.log('list.isValid', list.isValid());
      console.log('list', list);
      db.saveCarLog(coords.latitude, coords.longitude, position.timestamp)
        .then(log => {
          console.log('saveCarLog done', log);
        })
        .catch(e => {
          console.log(e);
        });
    });
  }

  removeLocator() {
    this.watchID != null && Geolocation.clearWatch(this.watchID);
  }

  renderItem(item) {
    return (
      <View style={styles.itemContainer}>
        <Text>{item.latitude}</Text>
        <Text>{item.longitude}</Text>
        <Text>{item.created}</Text>
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
    marginRight: 10,
  },
});
