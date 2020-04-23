/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, View, StyleSheet, SafeAreaView, FlatList} from 'react-native';
import Geocoder from 'react-native-geocoding';
import {Icon} from 'react-native-elements';
import {REACT_APP_GOOGLE_API_KEY} from 'react-native-dotenv';

import Database from '../module/database';
import YearPicker from '../view/yearPicker';
import MonthPicker from '../view/monthPicker';
import {TimeUtil, toFixed, getKilometers} from '../module/util';

export default class TripScreen extends React.Component {
  state = {
    realm: null,
    year: null,
    month: null,
    pickerItems: [],
    list: [],
  };

  constructor(props) {
    super(props);
    this.initHeaderMenu();
  }

  componentDidMount() {
    console.log('trip componentDidMount');
    this.initGeocoder();
    this.openDatabase();
  }

  componentWillUnmount() {
    console.log('trip componentWillUnmount');
    this.closeDatabase();
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
        this.getList();
      });
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
  }

  initPicker(realm) {
    const items = Database.getYearListOfTripForPicker(realm);
    console.log('pickerItems', items);
    this.setPickerItems(items);
  }

  initGeocoder() {
    const options = {language: 'ko'};
    Geocoder.init(REACT_APP_GOOGLE_API_KEY, options);
  }

  initHeaderMenu() {
    this.props.navigation.setOptions({
      headerRight: () => (
        <View style={styles.menuContainer}>
          <Icon
            iconStyle={styles.menuItem}
            onPress={() => {}}
            name="address"
            type="entypo"
          />
        </View>
      ),
    });
  }

  getList() {
    console.log('trip getList');
    const {realm, year, month} = this.state;
    if (!realm) {
      return;
    }
    const trips =
      year && month
        ? Database.getTripListByYearMonth(realm, year, month + 1, false)
        : Database.getTripList(this.state.realm).sorted('created', false);
    const list = trips.filtered('endCreated != null');
    console.log('getList list', list.length);
    this.setState({list});
  }

  renderItem(item) {
    const tripLabel = '도착';
    const endCreated = item.endCreated
      ? TimeUtil.timeToHourMin(item.endCreated)
      : '미확정';
    const endLatitude = item.endLatitude ? toFixed(item.endLatitude) : 0;
    const endLongitude = item.endLongitude ? toFixed(item.endLongitude) : 0;
    const totalDistance = getKilometers(item.totalDistance);
    const tripTypeLabel = Database.Trip.getTypeLabel(item.type);
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.dateText}>
            {TimeUtil.timeToMonthDay(item.startCreated)}
          </Text>
          <Text>{TimeUtil.timeToWeek(item.startCreated)}</Text>
        </View>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.titleText}>
            {'출발'} {TimeUtil.timeToHourMin(item.startCreated)}
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
          <Text>{tripTypeLabel}</Text>
        </View>
      </View>
    );
  }

  render() {
    console.log('trip render');
    const {list, year, month, pickerItems} = this.state;
    // console.log('list', list.length);
    // console.log('year', year, 'month', month);
    return (
      <SafeAreaView style={styles.container}>
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
          data={list}
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
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
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
  menuContainer: {
    flexDirection: 'row',
  },
  menuItem: {
    marginRight: 10,
  },
  yearMonthPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // marginHorizontal: 10,
    marginVertical: 10,
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
