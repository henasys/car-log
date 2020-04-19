import React from 'react';
import {StyleSheet, Text, View, FlatList, SafeAreaView} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {Locator} from '../module/locator';
import {msToTime, timeToDate, timeToHourMin} from '../module/util';
import {calculateLocationList, fixLastLocation} from '../module/util';
import FileManager from '../module/file';

const NUMBERS_PER_PAGE = 50;

export default class LocationScreen extends React.Component {
  state = {
    realm: null,
    list: [],
  };

  pagingStartIndex = 0;
  locator = Locator.getInstance();

  constructor(props) {
    super(props);
    this.props.navigation.setOptions({
      headerRight: () => (
        <View style={styles.menuContainer}>
          <Icon
            iconStyle={styles.menuItem}
            onPress={() => {
              console.log('save');
              this.writeJsonToFile();
            }}
            name="save"
            type="material"
          />
          <Icon
            iconStyle={styles.menuItem}
            onPress={() => {
              console.log('restore');
              this.readJsonFromFile();
              // this.readJsonThruFile();
            }}
            name="restore"
            type="material"
          />
        </View>
      ),
    });
  }

  componentDidMount() {
    console.log('location componentDidMount');
    this.addLocatorUpdater();
    this.setDatabase();
  }

  componentWillUnmount() {
    console.log('location componentWillUnmount');
    this.removeLocatorUpdater();
  }

  setDatabase() {
    const realm = Database.getRealm();
    console.log('realm', realm.schemaVersion);
    if (realm === null) {
      console.log('realm is null');
    }
    this.setState({realm}, () => {
      this.initList();
    });
  }

  addLocatorUpdater() {
    this.locatorUpdater = Locator.getInstance()
      .getUpdater()
      .subscribe({
        next: payload => {
          console.log('Locator updater observer', payload);
          this.initList();
        },
      });
  }

  removeLocatorUpdater() {
    this.locatorUpdater && this.locatorUpdater.unsubscribe();
  }

  initList() {
    console.log('initList');
    this.pagingStartIndex = 0;
    const list = this.getList(this.pagingStartIndex);
    // console.log('list', list);
    this.setState({list});
  }

  onLoadPreviousList() {
    console.log('onLoadPreviousList', this.pagingStartIndex);
    const logs = this.getList(this.pagingStartIndex + NUMBERS_PER_PAGE);
    if (logs.length !== 0) {
      this.pagingStartIndex += NUMBERS_PER_PAGE;
      const {list} = this.state;
      fixLastLocation(list, logs[0]);
      this.setState({list: list.concat(logs)});
    }
  }

  onRefreshList() {
    console.log('onRefreshList');
    this.initList();
  }

  getList(startIndex) {
    console.log('getList startIndex', startIndex);
    if (this.state.realm === null) {
      return [];
    }
    const list = Database.getLocationList(this.state.realm).sorted(
      'created',
      true,
    );
    const sliced = list.slice(startIndex, startIndex + NUMBERS_PER_PAGE);
    // console.log('getList', sliced);
    return calculateLocationList(sliced);
  }

  filename = 'location_data_backup.json';

  writeJsonToFile() {
    const list = Database.getLocationList(this.state.realm).sorted(
      'created',
      true,
    );
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
        const locations = JSON.parse(json);
        const locationList = Object.values(locations);
        console.log('locationList.length', locationList.length);
        this.restoreToDatabase(locationList);
      })
      .catch(e => {
        console.log(e);
      });
  }

  readJsonThruFile() {
    // const json = require('../json/car-log-location-2020.json');
    // const locationList = Object.values(json);
    // console.log('locationList.length', locationList.length);
    // this.restoreToDatabase(locationList);
  }

  restoreToDatabase(locationList) {
    const lastIndex = locationList.length - 1;
    locationList.forEach((location, index) => {
      Database.saveLocation(
        this.state.realm,
        location.latitude,
        location.longitude,
        location.speed,
        location.heading,
        location.accuracy,
        location.created,
      )
        .then(newLocation => {
          console.log('saveLocation done', newLocation.created);
          if (index === lastIndex) {
            this.initList();
          }
        })
        .catch(e => {
          console.log('saveLocation', e);
        });
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
          <Text>speed: {item.speed}</Text>
          <Text>heading: {item.heading}</Text>
          <Text>accuracy: {item.accuracy}</Text>
        </View>
      </View>
    );
  }

  render() {
    const {list} = this.state;
    console.log('location render', list.length);
    if (list.length === 0) {
      return (
        <View style={styles.alertMessage}>
          <Text style={styles.alertMessageText}>운행 기록이 없습니다.</Text>
        </View>
      );
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.ListContainer}>
          <FlatList
            ref={ref => (this.flatList = ref)}
            data={list}
            renderItem={({item}) => this.renderItem(item)}
            keyExtractor={(item, index) => `${item.created}_${index}`}
            onEndReached={this.onLoadPreviousList.bind(this)}
            onRefresh={this.onRefreshList.bind(this)}
            refreshing={false}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    margin: 10,
    transform: [{scaleY: -1}],
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  ListContainer: {
    flex: 1,
    padding: 0,
    margin: 0,
    transform: [{scaleY: -1}],
  },
  alertMessage: {
    paddingVertical: 10,
    // backgroundColor: '#DCDCDC',
    alignItems: 'center',
  },
  alertMessageText: {
    fontSize: 16,
  },
  menuContainer: {
    flexDirection: 'row',
  },
  menuItem: {
    marginRight: 10,
  },
});
