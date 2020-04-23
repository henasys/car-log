import React from 'react';
import {Text, View, StyleSheet, SafeAreaView, FlatList} from 'react-native';
import Geocoder from 'react-native-geocoding';
import {Icon} from 'react-native-elements';
import {REACT_APP_GOOGLE_API_KEY} from 'react-native-dotenv';

import Database from '../module/database';
import {TimeUtil, toFixed, getKilometers} from '../module/util';
import TripTypeButton from '../view/tripTypeButton';

const NUMBERS_PER_PAGE = 10;

export default class TripScreen extends React.Component {
  state = {
    realm: null,
    list: [],
  };

  pagingStartIndex = 0;

  constructor(props) {
    super(props);
    this.initHeaderMenu();
  }

  componentDidMount() {
    console.log('trip componentDidMount');
    this.initGeocoder();
    this.setDatabase();
  }

  componentWillUnmount() {
    console.log('trip componentWillUnmount');
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
    const list = Database.getTripList(this.state.realm).sorted('created', true);
    const sliced = list.slice(startIndex, startIndex + NUMBERS_PER_PAGE);
    // console.log('getList', sliced);
    return sliced;
  }

  renderItem(item) {
    const tripLabel = '도착';
    const endCreated = item.endCreated
      ? TimeUtil.timeToHourMin(item.endCreated)
      : '미확정';
    const endLatitude = item.endLatitude ? toFixed(item.endLatitude) : 0;
    const endLongitude = item.endLongitude ? toFixed(item.endLongitude) : 0;
    const totalDistance = getKilometers(item.totalDistance);
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemColumnContainer}>
          <Text style={styles.dateText}>
            {TimeUtil.timeToMonthDay(item.startCreated)}
          </Text>
          <Text>{TimeUtil.timeToWeek(item.startCreated)}</Text>
        </View>
        <View style={styles.itemStartEndContainer}>
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
          <TripTypeButton
            keepState="true"
            type={item.type}
            onValueChanged={value => {
              console.log('item', item);
              Database.updateTripType(this.state.realm, item.id, value)
                .then(newTrip => {
                  console.log('updateTripType done', newTrip.id);
                })
                .catch(e => {
                  console.log('updateTripType error', e);
                });
            }}
          />
        </View>
      </View>
    );
  }

  render() {
    const {list} = this.state;
    console.log('trip render', list.length);
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
  ListContainer: {
    flex: 1,
    padding: 0,
    margin: 0,
    transform: [{scaleY: -1}],
  },
  itemContainer: {
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
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
  itemColumnContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
  },
  itemStartEndContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  menuContainer: {
    flexDirection: 'row',
  },
  menuItem: {
    marginRight: 10,
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
