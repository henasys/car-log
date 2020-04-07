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
    console.log('previousLocation', this.previousLocation);
    console.log(
      'previousLocation',
      timeToDateHourMin(this.previousLocation.created),
      this.previousLocation.created,
    );
  }

  getList() {
    console.log('main getList');
    const list = Database.getTripList(this.state.realm)
      // .filtered('endCreated != null')
      .sorted('created', true);
    console.log(
      'list',
      list.map(x => {
        return {created: x.created, date: timeToDateHourMin(x.created)};
      }),
    );
    if (list.length === 0) {
      return;
    }
    // this.deleteTrips(list);
    this.getRemainedLocationList();
    this.setState({list});
  }

  // test purpose only
  deleteTrips(list) {
    const deleteList = list.filtered('created >= $0', 1586221200000);
    console.log('deleteList', deleteList);
    try {
      this.state.realm.write(() => {
        this.state.realm.delete(deleteList);
      });
    } catch (error) {
      console.log(error);
    }
  }

  getRemainedLocationList() {
    const list = Database.getTripList(this.state.realm)
      .sorted('created', true)
      .slice(0, 1);
    const lastTrip = list.length === 1 ? list[0] : {};
    const lastTimestamp = lastTrip.endCreated || lastTrip.startCreated;
    console.log('lastTrip', lastTrip);
    const locations = Database.getLocationListByTimestamp(
      this.state.realm,
      lastTimestamp,
    );
    // console.log('to be processing locations', locations.map(x => x.created));
    this.doDetectOnRemainedLocationList(locations);
  }

  doDetectOnRemainedLocationList(locations) {
    if (locations.length === 0) {
      return;
    }
    const detector = this.newTripDetector();
    let previous = locations[0];
    for (let index = 1; index < locations.length; index++) {
      const location = locations[index];
      previous = detector.detect(location, previous);
    }
    const result = detector.getResult();
    console.log('result', result.length);
    this.saveTripResult(result);
  }

  saveTripResult(result) {
    result.forEach(trip => {
      Database.saveTrip(
        this.state.realm,
        trip.start,
        trip.end,
        trip.end && trip.end.totalDistance,
      )
        .then(newTrip => {
          console.log('saveTrip done', newTrip);
        })
        .catch(e => {
          console.log('saveTrip error', e);
        });
    });
  }

  initTripDetector() {
    if (this.tripDetector) {
      return;
    }
    const tripStartCallback = item => {
      console.log(
        'tripStartCallback',
        item.created,
        timeToDateHourMin(item.created),
      );
      console.log(item);
    };
    const tripEndCallback = item => {
      console.log(
        'tripEndCallback',
        item.created,
        timeToDateHourMin(item.created),
      );
      console.log(item);
    };
    const detector = this.newTripDetector();
    detector.setTripStartCallback(tripStartCallback);
    detector.setTripEndCallback(tripEndCallback);
    this.tripDetector = detector;
    // console.log('tripDetector', detector);
  }

  newTripDetector() {
    const detector = new TripDetector(
      this.setting.period,
      this.setting.accuracyMargin,
      this.setting.radiusOfArea,
      this.setting.speedMargin,
    );
    return detector;
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
    this.updateTrip(newTrip);
  }

  newTrip(newTrip) {
    this.setState({trip: newTrip});
  }

  updateTrip(newTrip) {
    const {trip} = this.state;
    this.setState({trip: {...trip, ...newTrip}});
  }

  renderItem(item) {
    if (!item.startCreated) {
      return (
        <View style={styles.tripMessage}>
          <Text style={styles.tripMessageText}>아직 출발 전입니다.</Text>
        </View>
      );
    }
    const endCreated = item.endCreated
      ? timeToHourMin(item.endCreated)
      : '미확정';
    const endLatitude = item.endLatitude ? toFixed(item.endLatitude) : 0;
    const endLongitude = item.endLongitude ? toFixed(item.endLongitude) : 0;
    const totalDistance = toFixed(item.totalDistance / 1000) + ' km';
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
            {'도착'} {endCreated}
          </Text>
          <Text style={styles.addressText}>
            {'    '} 좌표: {endLatitude}, {endLongitude}
          </Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.totalDistanceText}>{totalDistance}</Text>
        </View>
      </View>
    );
  }

  render() {
    console.log('main render');
    const {trip, list} = this.state;
    console.log('list', list.length);
    console.log('trip', trip);
    return (
      <View style={styles.container}>
        <View style={styles.currentTrip}>{this.renderItem(trip)}</View>
        <FlatList
          data={list}
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
    marginVertical: 10,
  },
  tripMessage: {
    alignItems: 'center',
  },
  tripMessageText: {
    fontSize: 18,
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
