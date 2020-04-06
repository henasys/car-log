import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';

import Database from '../module/database';
import {Locator} from '../module/locator';
import {
  timeToWeek,
  timeToHourMin,
  timeToMonthDay,
  timeToDateHourMin,
  toFixed,
  initEmptyLocation,
  positionToLocation,
  tripCallbackItemToTripRecord,
} from '../module/util';
import {toast} from '../module/toast';
import {TripDetector} from '../module/detector';

export default class MainScreen extends React.Component {
  state = {
    realm: null,
    trip: {},
    list: [],
  };

  locator = Locator.getInstance();

  componentDidMount() {
    console.log('main componentDidMount');
    this.openDatabase();
    this.locator.initLocator(
      this.handleOnLocation.bind(this),
      this.handleOnLocationError.bind(this),
    );
    this.getCurrentPosition();
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
      this.initTripDetector();
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
  }

  getCurrentPosition() {
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

  getSetting() {
    const setting = Database.getSetting(this.state.realm);
    this.setting = setting;
    // console.log('setting', setting);
  }

  getLatestLocation() {
    const locations = Database.getLocationList(this.state.realm).sorted(
      'created',
      true,
    );
    const sliced = locations.slice(0, 1);
    this.previousLocation =
      sliced.length === 1 ? sliced[0] : initEmptyLocation();
    const newTrip = {
      startLatitude: this.previousLocation.latitude,
      startLongitude: this.previousLocation.longitude,
      startCreated: this.previousLocation.created,
      totalDistance: 0,
    };
    this.newTrip(newTrip);
    console.log('previousLocation', this.previousLocation);
    console.log(
      'previousLocation',
      timeToDateHourMin(this.previousLocation.created),
      this.previousLocation.created,
    );
  }

  getList() {
    const list = Database.getTripList(this.state.realm).sorted('created', true);
    // console.log('list', list);
    this.setState({list});
  }

  initTripDetector() {
    const tripStartCallback = item => {
      console.log('tripStartCallback', item.created);
      const startTrip = tripCallbackItemToTripRecord(item);
      this.newTrip(startTrip);
    };
    const tripEndCallback = item => {
      console.log('tripEndCallback', item.created);
      const endTrip = tripCallbackItemToTripRecord(item);
      this.updateTrip(endTrip);
    };
    const detector = new TripDetector(
      this.setting.period,
      this.setting.accuracyMargin,
      this.setting.radiusOfArea,
      this.setting.speedMargin,
    );
    detector.setTripStartCallback(tripStartCallback);
    detector.setTripEndCallback(tripEndCallback);
    this.tripDetector = detector;
    console.log('tripDetector', detector);
  }

  handleOnLocation(position) {
    const coords = position && position.coords;
    if (!coords) {
      return;
    }
    this.handleWithDetector(positionToLocation(position));
    Database.saveLocation(
      this.state.realm,
      coords.latitude,
      coords.longitude,
      coords.speed,
      coords.heading,
      coords.accuracy,
      position.timestamp,
    )
      .then(log => {
        console.log('saveLocation done', log);
        const msg = `new: ${coords.latitude}, ${coords.longitude}`;
        toast(msg);
        const updater = this.locator.getUpdater();
        updater.next(coords);
      })
      .catch(e => {
        console.log('saveLocation', e);
      });
  }

  handleOnLocationError(error) {
    const msg = `${error.code}: ${error.message}`;
    toast(msg);
  }

  handleWithDetector(current) {
    // this.tripDetector.clearResult();
    console.log('handleWithDetector', current.created);
    console.log('previousLocation', this.previousLocation);
    this.previousLocation = this.tripDetector.detect(
      current,
      this.previousLocation,
    );
    const totalDistance = this.tripDetector.getTotalDistance();
    const lastPrevious = this.tripDetector.getLastPrevious();
    console.log('totalDistance', totalDistance);
    console.log('lastPrevious', lastPrevious);
    const newTrip = {
      endLatitude: this.previousLocation.latitude,
      endLongitude: this.previousLocation.longitude,
      endCreated: this.previousLocation.created,
      totalDistance: totalDistance,
    };
    if (this.state.trip.startCreated === this.previousLocation.created) {
      console.log('not yet ready to start');
    } else {
      this.updateTrip(newTrip);
    }
  }

  newTrip(newTrip) {
    this.setState({trip: newTrip});
  }

  updateTrip(newTrip) {
    const {trip} = this.state;
    this.setState({trip: {...trip, ...newTrip}});
  }

  renderItem(item, currentTrip = false) {
    if (!item.endCreated) {
      return (
        <View style={styles.tripMessage}>
          <Text>아직 출발 전입니다.</Text>
        </View>
      );
    }
    const totalDistance = toFixed(item.totalDistance / 1000) + ' km';
    const tripLabel = currentTrip ? '운행중' : '도착';
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.dateText}>
            {timeToMonthDay(item.startCreated)}
          </Text>
          <Text>{timeToWeek(item.startCreated)}</Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.titleText}>
            {'출발'} {timeToHourMin(item.startCreated)}
          </Text>
          <Text style={styles.addressText}>
            {'    '} 좌표: {toFixed(item.startLatitude)},{' '}
            {toFixed(item.startLongitude)}
          </Text>
          <Text style={styles.titleText}>
            {tripLabel} {timeToHourMin(item.endCreated)}
          </Text>
          <Text style={styles.addressText}>
            {'    '} 좌표: {toFixed(item.endLatitude)},{' '}
            {toFixed(item.endLongitude)}
          </Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.totalDistanceText}>{totalDistance}</Text>
        </View>
      </View>
    );
  }

  render() {
    const {trip} = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.currentTrip}>{this.renderItem(trip, true)}</View>
        <FlatList
          data={this.state.list}
          renderItem={({item}) => this.renderItem(item)}
          keyExtractor={(item, index) => String(index)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentTrip: {
    margin: 10,
  },
  tripMessage: {
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
    // borderWidth: 1,
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
    // borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  totalDistanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
  },
});
