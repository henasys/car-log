import React from 'react';
import {Text, View, StyleSheet, SafeAreaView} from 'react-native';
import Geocoder from 'react-native-geocoding';
import {Icon} from 'react-native-elements';
import {REACT_APP_GOOGLE_API_KEY} from 'react-native-dotenv';

import Database from '../module/database';
import TripList from '../view/tripListSwipeable';

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
    this.setState({list: newList});
  }

  render() {
    const {list, realm} = this.state;
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
