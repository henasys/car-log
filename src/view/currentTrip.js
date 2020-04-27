import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

import Database from '../module/database';
import {TimeUtil, getKilometers} from '../module/util';
import Color from '../module/color';
import TripButton from '../view/tripButton';
import TripPurposeButton from '../view/tripPurposeButton';

const getParamsFromCurrentTrip = (item, today) => {
  console.log('getParamsFromCurrentTrip', item);
  const time = today.format('HH:mm');
  let startLabel = '출발';
  let startTime = time;
  let startDisabled = false;
  let endLabel = '도착';
  let endTime = '00:00';
  let endDisabled = true;
  let totalDistance = getKilometers(0.0);
  let tripPurpose = item.tripPurpose
    ? item.tripPurpose
    : Database.Trip.PurposeType.COMMUTE;
  if (item.startCreated) {
    endTime = time;
    startLabel = '운행중';
    startTime = TimeUtil.timeToHourMin(item.startCreated);
    startDisabled = true;
    endDisabled = false;
    totalDistance = getKilometers(item.totalDistance);
  }
  return {
    startLabel,
    startTime,
    startDisabled,
    endLabel,
    endTime,
    endDisabled,
    totalDistance,
    tripPurpose,
  };
};

export default function CurrentTrip({
  trip,
  today,
  onTripPurposeChanged,
  onStartButton,
  onEndButton,
}) {
  const params = getParamsFromCurrentTrip(trip, today);
  return (
    <View style={styles.currentTrip}>
      <View style={styles.tripDate}>
        <Text style={styles.todayDate}>
          {today.format('LL')} ({today.format('dd')})
        </Text>
        <View style={styles.tripPurpose}>
          <TripPurposeButton
            keepState="true"
            purpose={params.tripPurpose}
            onValueChanged={onTripPurposeChanged}
          />
        </View>
      </View>
      <View style={styles.tripContainer}>
        <TripButton
          label={params.startLabel}
          time={params.startTime}
          disabled={params.startDisabled}
          onPress={onStartButton}
        />
        <TripButton
          label={params.endLabel}
          time={params.endTime}
          disabled={params.endDisabled}
          onPress={onEndButton}
        />
      </View>
      <View style={styles.tripDistance}>
        <Text style={styles.tripDistanceText}>{params.totalDistance}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentTrip: {
    paddingVertical: 10,
    backgroundColor: '#DCDCDC',
    justifyContent: 'center',
  },
  tripDate: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  tripPurpose: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 0,
  },
  todayDate: {
    fontSize: 22,
    fontWeight: 'normal',
    paddingHorizontal: 10,
    color: Color.font1,
  },
  tripContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  tripDistance: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripDistanceText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Color.bg1,
    borderRadius: 10,
  },
});
