import React from 'react';
import {Text, View, StyleSheet, SafeAreaView} from 'react-native';
import Geocoder from 'react-native-geocoding';
import {Button} from 'react-native-elements';
import {Overlay} from 'react-native-elements';
import ProgressBar from 'react-native-progress/Bar';
import {REACT_APP_GOOGLE_API_KEY} from 'react-native-dotenv';

import Database from '../module/database';
import Network from '../module/network';
import Color from '../module/color';
import {TripType} from '../module/type';
import TripList from '../view/tripListSwipeable';
import MyAlert from '../view/alert';

const NUMBERS_PER_PAGE = 10;

export default class TripScreen extends React.Component {
  state = {
    realm: null,
    list: [],
    emptyList: [],
    isVisibleForOverlay: false,
    progress: 0,
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
      this.initEmptyAddressTripList(realm);
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
          <Button
            buttonStyle={styles.menuItem}
            titleStyle={styles.menuTitle}
            onPress={() => {
              const callback = () => {
                console.log('Network.checkNetInfo ok');
                this.setState({isVisibleForOverlay: true, progress: 0});
              };
              const errorCallback = () => {
                MyAlert.showAlert(
                  '인터넷 연결 오류',
                  '현재 인터넷 사용이 가능한 상태가 아닙니다. 와이파이 또는 이동통신 연결을 확인해주세요.',
                );
              };
              Network.checkNetInfo(callback, errorCallback);
            }}
            title="주소변환"
            type="clear"
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

  initEmptyAddressTripList(realm) {
    const emptyList = Database.getEmptyAddressTripList(realm);
    this.setState({emptyList});
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

  onDeleteRow(rowKey) {
    Database.deleteTripById(this.state.realm, rowKey)
      .then(() => {
        console.log('Database.deleteTripById done', rowKey);
      })
      .catch(e => {
        console.log('Database.deleteTripById error', rowKey, e);
      });
  }

  onSetList(newList) {
    console.log('onSetList', newList.length);
    this.setState({list: newList});
  }

  onMergeRow(tripId, nextId, rowIndex) {
    console.log('onMergeRow');
    Database.mergeTrip(this.state.realm, tripId, nextId)
      .then(trip => {
        console.log('Database.mergeTrip done', tripId);
        const newList = [...this.state.list];
        newList[rowIndex] = trip;
        newList.splice(rowIndex - 1, 1);
        this.onSetList(newList);
      })
      .catch(e => {
        console.log('Database.mergeTrip error', tripId, e);
      });
  }

  handleAddressTransform(realm, emptyList) {
    const processList = [];
    emptyList.forEach(trip => {
      if (trip.startLatitude) {
        const location = {
          lat: trip.startLatitude,
          lng: trip.startLongitude,
          tripId: trip.id,
          tripType: TripType.START,
        };
        processList.push(location);
      }
      if (trip.endLatitude) {
        const location = {
          lat: trip.endLatitude,
          lng: trip.endLongitude,
          tripId: trip.id,
          tripType: TripType.END,
        };
        processList.push(location);
      }
    });
    console.log('processList', processList.length);
    processList.forEach((location, index) => {
      Geocoder.from(location)
        .then(response => {
          console.log('location', location);
          console.log('Geocoder.from', JSON.stringify(response.results[0]));
          if (!response.results || response.results.length === 0) {
            return new Error('response.results is empty');
          }
          const address = response.results[0].formatted_address;
          if (location.tripType === TripType.START) {
            return Database.updateTripStartAddress(
              realm,
              location.tripId,
              address,
            );
          } else {
            return Database.updateTripEndAddress(
              realm,
              location.tripId,
              address,
            );
          }
        })
        .then(trip => {
          console.log('Database.updateTrip with Address done', trip.id);
        })
        .catch(e => {
          console.log('Geocoder.from error', e);
        })
        .finally(() => {
          const progressValue = (index + 1) / processList.length;
          this.setState({progress: progressValue});
        });
    });
  }

  render() {
    const {list, realm} = this.state;
    const {emptyList, isVisibleForOverlay, progress} = this.state;
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
          <TripList
            list={list}
            realm={realm}
            transform
            onLoadPreviousList={this.onLoadPreviousList.bind(this)}
            onRefreshList={this.onRefreshList.bind(this)}
            onDeleteRow={this.onDeleteRow.bind(this)}
            onSetList={this.onSetList.bind(this)}
            onMergeRow={this.onMergeRow.bind(this)}
          />
        </View>
        <Overlay
          isVisible={isVisibleForOverlay}
          windowBackgroundColor="rgba(0, 0, 0, .5)"
          overlayBackgroundColor="white"
          width="80%"
          height="auto">
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayTitle}>위도/경도 주소 변환</Text>
            <View style={styles.verticalSpacer} />
            <Text style={styles.overlayContents}>
              변환할 건수: {emptyList.length}
            </Text>
            <View style={styles.verticalSpacer} />
            <ProgressBar progress={progress} width={null} />
            <View style={styles.verticalSpacer} />
            <View style={styles.buttonsContainer}>
              <Button
                title="닫기"
                type="outline"
                onPress={() => this.setState({isVisibleForOverlay: false})}
              />
              <Button
                title="변환"
                type="outline"
                onPress={() => {
                  this.handleAddressTransform(realm, emptyList);
                }}
              />
            </View>
          </View>
        </Overlay>
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
  menuTitle: {
    color: Color.black,
  },
  verticalSpacer: {
    marginVertical: 10,
  },
  overlayContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  overlayTitle: {
    fontSize: 18,
  },
  overlayContents: {
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
