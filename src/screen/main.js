/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, Text, View, FlatList, SafeAreaView} from 'react-native';
import {Button} from 'react-native-elements';

import Database from '../module/database';
import {Locator} from '../module/locator';
import {
  timeToWeek,
  timeToHourMin,
  timeToMonthDay,
  timeToDateHourMin,
  toFixed,
  positionToLocation,
  tripCallbackItemToTripRecord,
  clone,
} from '../module/util';
import {toast} from '../module/toast';
import {TripDetector} from '../module/detector';
import FileManager from '../module/file';
import YearPicker from '../view/yearPicker';
import MonthPicker from '../view/monthPicker';

export default class MainScreen extends React.Component {
  state = {
    realm: null,
    year: null,
    month: null,
    pickerItems: [],
    trip: {},
    list: [],
  };

  locator = Locator.getInstance();
  setting = null;
  tripDetector = null;
  listFirstTotalDistance = 0;

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

  setYear(year) {
    this.setState({year}, () => {
      this.getList();
    });
  }

  setMonth(month) {
    this.setState({month}, () => {
      this.getList();
    });
  }

  setPickerItems(pickerItems) {
    this.setState({pickerItems});
  }

  openDatabase() {
    Database.open(realm => {
      this.setState({realm}, () => {
        Database.setRealm(realm);
        this.initPicker(realm);
        this.initTripDetector(realm);
        this.getRemainedLocationList(realm);
        this.getList();
      });
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

  initTripDetector(realm) {
    const setting = Database.getSetting(realm);
    this.setting = setting;
    // console.log('setting', setting);
    this.tripDetector = this.newTripDetector();
  }

  initPicker(realm) {
    const items = Database.getYearListOfTripForPicker(realm);
    console.log('pickerItems', items);
    this.setPickerItems(items);
  }

  getList() {
    console.log('main getList');
    const {realm, year, month} = this.state;
    if (!realm) {
      return;
    }
    const list =
      year && month
        ? Database.getTripListByYearMonth(realm, year, month + 1, true)
        : Database.getTripList(this.state.realm).sorted('created', true);
    // this.deleteTrips(list);
    // this.writeJsonToFile(list);
    // this.readJsonFromFile();
    console.log('getList list', list.length);
    this.setState({list});
    // this.testNewLocation();
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

  filename = 'trip_data_backup.json';

  writeJsonToFile(list) {
    const json = JSON.stringify(list);
    FileManager.writeToTemp(this.filename, json)
      .then(() => {
        console.log('writeJsonToFile done');
      })
      .catch(e => {
        console.log(e);
      });
  }

  readJsonFromFile() {
    FileManager.readFromTemp(this.filename)
      .then(json => {
        console.log('readJsonFromFile done', json.slice(0, 300));
      })
      .catch(e => {
        console.log(e);
      });
  }

  getRemainedLocationList(realm) {
    const list = Database.getTripList(realm)
      .sorted('created', true)
      .slice(0, 1);
    const lastTrip = list.length === 1 ? list[0] : {};
    const lastTimestamp = lastTrip.endCreated || lastTrip.startCreated || 0;
    console.log('lastTrip', lastTrip);
    if (lastTrip.startCreated && !lastTrip.endCreated) {
      const tripIdFinder = this.tripDetector.getTripIdFinder();
      const initNumber = this.tripDetector.getNumber();
      tripIdFinder.add(initNumber, lastTrip.id);
    }
    const locations = Database.getLocationListByTimestamp(
      this.state.realm,
      lastTimestamp,
    ).sorted('created', false);
    // console.log('to be processing locations', locations.map(x => x.created));
    console.log('to be processing locations', locations.length);
    this.doDetectOnRemainedLocationList(locations);
  }

  doDetectOnRemainedLocationList(locations) {
    if (locations.length === 0) {
      return;
    }
    this.tripDetector.setPreviousLocation(locations[0]);
    for (let index = 1; index < locations.length; index++) {
      const location = locations[index];
      this.tripDetector.detectAtOnce(location);
    }
    this.tripDetector.setAllowTripEndAtFirst(true);
    const result = this.tripDetector.getResult();
    console.log('result', result.length);
    const previousLocation = this.tripDetector.getPreviousLocation();
    const lastPrevious = this.tripDetector.getLastPrevious();
    const totalDistance = this.tripDetector.getTotalDistance();
    this.listFirstTotalDistance = totalDistance;
    console.log('previousLocation', previousLocation);
    console.log('lastPrevious', lastPrevious);
    console.log('totalDistance', totalDistance);
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
    const startTrip = tripCallbackItemToTripRecord(item);
    this.newTrip(startTrip);
    const tripIdFinder = this.tripDetector.getTripIdFinder();
    Database.saveTrip(this.state.realm, item)
      .then(trip => {
        console.log('saveTrip done', trip);
        tripIdFinder.add(item.number, trip.id);
      })
      .catch(e => {
        console.log('saveTrip error', e);
      });
  };

  tripEndCallback = item => {
    console.log(
      'tripEndCallback',
      item.created,
      timeToDateHourMin(item.created),
    );
    console.log(item);
    const tripIdFinder = this.tripDetector.getTripIdFinder();
    const tripId = tripIdFinder.find(item.number);
    console.log('tripId', tripId);
    if (!tripId) {
      console.log('not found matching trip id', item.number);
      return;
    }
    Database.updateTripEnd(
      this.state.realm,
      tripId.id,
      item,
      item.totalDistance,
    )
      .then(trip => {
        console.log('updateTripEnd done', trip);
      })
      .catch(e => {
        console.log('updateTripEnd error', e);
      });
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

  testNewLocation() {
    const location = {
      accuracy: 48,
      altitude: 68.0428826137193,
      heading: 0,
      latitude: 37.53006144198941,
      longitude: 126.99286469807542,
      speed: 0,
      created: 1586254156999,
    };
    setTimeout(() => {
      console.log('testNewLocation');
      this.handleWithDetector(location, true);
    }, 3000);
  }

  handleWithDetector(current, isTest = false) {
    console.log('handleWithDetector', current.created);
    if (!this.tripDetector) {
      return;
    }
    const tripIdFinder = this.tripDetector.getTripIdFinder();
    console.log('tripIdFinder', tripIdFinder.getList());
    this.tripDetector.detectAtOnce(current);
    const previousLocation = this.tripDetector.getPreviousLocation();
    const lastPrevious = this.tripDetector.getLastPrevious();
    const totalDistance = this.tripDetector.getTotalDistance();
    const isLocationChanged = this.tripDetector.getIsLocationChanged();
    console.log('previousLocation', previousLocation);
    console.log('lastPrevious', lastPrevious);
    console.log('totalDistance', totalDistance);
    if (isTest || isLocationChanged) {
      previousLocation.totalDistance = totalDistance;
      const updateTrip = tripCallbackItemToTripRecord(previousLocation, true);
      this.updateTrip(updateTrip);
    }
  }

  newTrip(newTrip) {
    console.log('newTrip', newTrip);
    this.setState({trip: newTrip});
  }

  updateTrip(updateTrip) {
    const {trip} = this.state;
    this.setState({trip: {...trip, ...updateTrip}});
  }

  listClone(list, trip) {
    const listFilter = trip.endCreated
      ? list.filtered('endCreated != null')
      : list;
    const listClone = listFilter.map(x => clone(x));
    if (listClone.length > 0) {
      const listFirst = listClone[0];
      if (!listFirst.endCreated) {
        listFirst.totalDistance = this.listFirstTotalDistance;
      }
    }
    return listClone;
  }

  renderItem(item, currentTrip = false) {
    if (currentTrip && !item.endCreated) {
      return (
        <View style={styles.tripMessage}>
          <Text style={styles.tripMessageText}>아직 출발 전입니다.</Text>
          {/* <Button
            type="outline"
            title={'출발'}
            icon={{name: 'car', type: 'material-community'}}
          /> */}
        </View>
      );
    }
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
    const {trip, list, year, month, pickerItems} = this.state;
    console.log('list', list.length);
    console.log('trip', trip);
    console.log('year', year, 'month', month);
    const listClone = this.listClone(list, trip);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.currentTrip}>{this.renderItem(trip, true)}</View>
        <View style={styles.yearMonthPickerContainer}>
          <View style={{width: '45%'}}>
            <YearPicker
              year={year}
              items={pickerItems}
              setYear={this.setYear.bind(this)}
            />
          </View>

          <View style={{paddingHorizontal: 5}} />
          <View style={{width: '45%'}}>
            <MonthPicker month={month} setMonth={this.setMonth.bind(this)} />
          </View>
        </View>
        <FlatList
          data={listClone}
          renderItem={({item}) => this.renderItem(item)}
          keyExtractor={(item, index) => String(index)}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentTrip: {
    paddingVertical: 10,
    backgroundColor: '#DCDCDC',
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
  yearMonthPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // marginHorizontal: 10,
    marginVertical: 10,
  },
});
