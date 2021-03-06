import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

import Database from '../module/database';
import TripPurposeButton from '../view/tripPurposeButton';
import {TimeUtil, toFixed, getKilometers} from '../module/util';

const addressOrLocation = (address, latitude, longitude) => {
  const latitudeLabel = latitude ? toFixed(latitude) : 0;
  const longitudeLabel = longitude ? toFixed(longitude) : 0;
  return address ? address : `좌표: ${latitudeLabel}, ${longitudeLabel}`;
};

export default function TripItem({
  item,
  realm,
  transform = null,
  keepStateOfTripPurposeButton = false,
}) {
  const tripLabel = '도착';
  const endCreated = item.endCreated
    ? TimeUtil.timeToHourMin(item.endCreated)
    : '미확정';
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
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.addressText}>
          {'    '}
          {addressOrLocation(
            item.startAddress,
            item.startLatitude,
            item.startLongitude,
          )}
        </Text>
        <Text style={styles.titleText}>
          {tripLabel} {endCreated}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.addressText}>
          {'    '}
          {addressOrLocation(
            item.endAddress,
            item.endLatitude,
            item.endLongitude,
          )}
        </Text>
      </View>
      <View style={styles.itemColumnContainer}>
        <Text style={styles.totalDistanceText}>{totalDistance}</Text>
        <TripPurposeButton
          keepState={keepStateOfTripPurposeButton}
          purpose={item.purpose}
          onValueChanged={value => {
            console.log('item', item);
            if (!realm) {
              return;
            }
            Database.updateTripPurposeType(realm, item.id, value)
              .then(newTrip => {
                console.log('updateTripPurposeType done', newTrip.id);
              })
              .catch(e => {
                console.log('updateTripPurposeType error', e);
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
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  itemColumnContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    backgroundColor: 'white',
  },
  itemStartEndContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '60%',
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
