import React, {useState, useEffect} from 'react';
import {StyleSheet, View, SectionList, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon} from 'react-native-elements';

import Database from '../module/database';

export default function DeleteScreen({route, navigation}) {
  const [realm, setRealm] = useState(null);
  const [list, setList] = useState([]);
  const openDatabase = () => {
    Database.open(newRealm => {
      setRealm(newRealm);
      console.log('setRealm() done');
    });
  };
  const closeDatabase = () => {
    Database.close(realm);
  };
  const initStates = () => {
    console.log('initStates');
    if (realm === null) {
      console.log('realm is null');
      return;
    }
    const yearList = Database.getYearMonthListOfTrip(realm);
    setList(yearList);
  };
  const doDelete = (year, month = null) => {
    console.log('doDelete', year, month);
    Database.deleteLocation(realm, year, month)
      .then(() => {
        console.log('Database.deleteLocation done');
        return Database.deleteTrip(realm, year, month);
      })
      .then(() => {
        console.log('Database.deleteTrip done');
        initStates();
      })
      .catch(e => {
        console.log(e);
      });
  };
  useEffect(() => {
    console.log('delete useEffect start');
    openDatabase();
    return () => {
      console.log('delete useEffect cleanup');
      closeDatabase();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    initStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm]);
  const Item = ({year, month, count}) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{month}월</Text>
      <Text style={styles.itemTitle}>{count}건</Text>
      <Icon
        iconStyle={styles.menuItem}
        onPress={() => {
          doDelete(year, month);
        }}
        name="remove-circle-outline"
        type="material"
      />
    </View>
  );
  const renderItem = item => {
    if (item.count === 0) {
      return <View />;
    }
    return <Item year={item.year} month={item.month} count={item.count} />;
  };
  const renderSectionHeader = ({year, count}) => {
    if (count === 0) {
      return (
        <View style={styles.alertMessage}>
          <Text style={styles.alertMessageText}>삭제할 기록이 없습니다.</Text>
        </View>
      );
    }
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{year}년</Text>
        <Icon
          iconStyle={styles.menuItem}
          onPress={() => {
            doDelete(year);
          }}
          name="remove-circle-outline"
          type="material"
        />
      </View>
    );
  };
  console.log('list', list);
  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={list}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => renderItem(item)}
        renderSectionHeader={({section}) => renderSectionHeader(section)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: 10,
    marginBottom: 10,
    // marginHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginLeft: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
  },
  headerText: {
    fontSize: 20,
  },
  itemTitle: {
    fontSize: 16,
  },
  alertMessage: {
    paddingVertical: 10,
    // backgroundColor: '#DCDCDC',
    alignItems: 'center',
  },
  alertMessageText: {
    fontSize: 16,
  },
});
