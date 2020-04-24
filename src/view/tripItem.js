import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

import Database from '../module/database';
import {TimeUtil, toFixed, getKilometers} from '../module/util';
import TripTypeButton from './tripTypeButton';

export default function TripItem({item, realm, transform = null}) {
  const tripLabel = '도착';
  const endCreated = item.endCreated
    ? TimeUtil.timeToHourMin(item.endCreated)
    : '미확정';
  const endLatitude = item.endLatitude ? toFixed(item.endLatitude) : 0;
  const endLongitude = item.endLongitude ? toFixed(item.endLongitude) : 0;
  const totalDistance = getKilometers(item.totalDistance);
  const containerStyle = transform
    ? {...styles.itemContainer, ...{transform: [{scaleY: -1}]}}
    : styles.itemContainer;
  return (
    <View style={containerStyle}>
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
            if (!realm) {
              return;
            }
            Database.updateTripType(realm, item.id, value)
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

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    margin: 0,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
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
