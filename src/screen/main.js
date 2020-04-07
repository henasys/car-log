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
  setting = null;
  tripDetector = null;

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
      this.getSetting();
      this.getList();
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
    const lastTimestamp = lastTrip.endCreated || lastTrip.startCreated || 0;
    console.log('lastTrip', lastTrip);
    const locations = Database.getLocationListByTimestamp(
      this.state.realm,
      lastTimestamp,
    );
    // console.log('to be processing locations', locations.map(x => x.created));
    console.log('to be processing locations', locations.length);
    this.doDetectOnRemainedLocationList(locations);
  }

  doDetectOnRemainedLocationList(locations) {
    if (locations.length === 0) {
      return;
    }
    const detector = this.newTripDetector();
    detector.setPreviousLocation(locations[0]);
    for (let index = 1; index < locations.length; index++) {
      const location = locations[index];
      detector.detectAtOnce(location);
    }
    const result = detector.getResult();
    console.log('result', result.length);
    const previousLocation = detector.getPreviousLocation();
    const lastPrevious = detector.getLastPrevious();
    const totalDistance = detector.getTotalDistance();
    console.log('previousLocation', previousLocation);
    console.log('lastPrevious', lastPrevious);
    console.log('totalDistance', totalDistance);
    const lastLocation = locations[locations.length - 1];
    const startTrip = tripCallbackItemToTripRecord(lastLocation);
    this.newTrip(startTrip);
    this.tripDetector = detector;
    this.saveTripResult(result);
  }

  saveTripResult(result) {
    if (result.length === 0) {
      console.log('setTripDetectorCallback');
      this.setTripDetectorCallback();
      return;
    }
    const tripIdFinder = this.tripDetector.getTripIdFinder();
    result.forEach((trip, index) => {
      Database.saveTrip(
        this.state.realm,
        trip.start,
        trip.end,
        trip.end && trip.end.totalDistance,
      )
        .then(newTrip => {
          console.log('saveTrip done', newTrip);
          tripIdFinder.add(trip.start.number, newTrip.id);
        })
        .catch(e => {
          console.log('saveTrip error', e);
        })
        .finally(() => {
          if (index === result.length - 1) {
            console.log('setTripDetectorCallback');
            this.setTripDetectorCallback();
          }
        });
    });
  }

  tripStartCallback = item => {
    console.log(
      'tripStartCallback',
      item.created,
      timeToDateHourMin(item.created),
    );
    console.log(item);
  };

  tripEndCallback = item => {
    console.log(
      'tripEndCallback',
      item.created,
      timeToDateHourMin(item.created),
    );
    console.log(item);
  };

  newTripDetector() {
    const detector = new TripDetector(
      this.setting.period,
      this.setting.accuracyMargin,
      this.setting.radiusOfArea,
      this.setting.speedMargin,
    );
    return detector;
  }

  setTripDetectorCallback() {
    this.tripDetector.setTripStartCallback(this.tripStartCallback);
    this.tripDetector.setTripEndCallback(this.tripEndCallback);
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
    console.log('handleWithDetector', current.created);
    if (!this.tripDetector) {
      return;
    }
    this.tripDetector.detectAtOnce(current);
    const previousLocation = this.tripDetector.getPreviousLocation();
    const lastPrevious = this.tripDetector.getLastPrevious();
    const totalDistance = this.tripDetector.getTotalDistance();
    console.log('previousLocation', previousLocation);
    console.log('lastPrevious', lastPrevious);
    console.log('totalDistance', totalDistance);
    const newTrip = {
      endLatitude: previousLocation.latitude,
      endLongitude: previousLocation.longitude,
      endCreated: previousLocation.created,
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

  renderItem(item, currentTrip = false) {
    // if (!item.startCreated || !item.endCreated) {
    //   return (
    //     <View style={styles.tripMessage}>
    //       <Text style={styles.tripMessageText}>아직 출발 전입니다.</Text>
    //     </View>
    //   );
    // }
    const tripLabel = currentTrip ? '운행' : '도착';
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
            {tripLabel} {endCreated}
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
        <View style={styles.currentTrip}>{this.renderItem(trip, true)}</View>
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
