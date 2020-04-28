import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native';
import moment from 'moment';

import Database from '../module/database';
import {TimeUtil, getKilometers} from '../module/util';
import Color from '../module/color';
import TripPurposeButton from '../view/tripPurposeButton';

const getParamsFromCurrentTrip = (item, today, onStartButton, onEndButton) => {
  console.log('getParamsFromCurrentTrip', item);
  const time = today && today.format('HH:mm');
  let status = '출발전';
  let buttonLabel = '출발하기';
  let buttonCallback = onStartButton;
  let startTime = '';
  let currentTime = time;
  let totalDistance = getKilometers(0.0);
  let purpose = item.purpose ? item.purpose : Database.Trip.PurposeType.COMMUTE;
  if (item.startCreated) {
    status = '운행중';
    buttonLabel = '도착 처리';
    buttonCallback = onEndButton;
    startTime = TimeUtil.timeToHourMin(item.startCreated);
    const todayTimestamp = today.toDate().getTime();
    if (item.startCreated >= todayTimestamp) {
      currentTime = startTime;
    }
    totalDistance = getKilometers(item.totalDistance);
  }
  return {
    status,
    buttonLabel,
    buttonCallback,
    startTime,
    currentTime,
    totalDistance,
    purpose,
  };
};

function TripAction({label, onPress}) {
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function TripDetail({status, startTime, currentTime, totalDistance}) {
  return (
    <View>
      <View style={styles.tripDetail}>
        <View style={styles.tripStatusAndDistance}>
          <Text style={[styles.tripBasicText, styles.tripBoldText]}>
            {status}
          </Text>
          <Text style={[styles.tripBasicText, styles.tripBoldText]}>
            {totalDistance}
          </Text>
        </View>
        <Text style={styles.tripBasicText}>
          출발 {'   '}
          {startTime}
        </Text>
        <Text style={styles.tripBasicText}>
          현재 {'   '}
          {currentTime}
        </Text>
      </View>
    </View>
  );
}

export default function CurrentTrip({
  navigation,
  trip,
  onTripPurposeChanged,
  onStartButton,
  onEndButton,
}) {
  const [today, setToday] = React.useState(null);
  const params = getParamsFromCurrentTrip(
    trip,
    today,
    onStartButton,
    onEndButton,
  );
  React.useEffect(() => {
    setToday(moment());
  }, []);
  React.useEffect(() => {
    let timerInterval = null;
    const unsubscribeFocus = navigation.addListener('focus', () => {
      console.log('CurrentTrip focus');
      timerInterval = setTimerInterval();
      console.log('timerInterval', timerInterval);
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('CurrentTrip blur');
      console.log('timerInterval', timerInterval);
      clearTimerInterval(timerInterval);
    });
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      clearTimerInterval(timerInterval);
    };
  }, [navigation]);
  const setTimerInterval = () => {
    const interval = 29000;
    const timerInterval = setInterval(() => {
      console.log('run with timerInterval', interval);
      setToday(moment());
    }, interval);
    return timerInterval;
  };
  const clearTimerInterval = timerInterval => {
    clearInterval(timerInterval);
  };
  console.log('CurrentTrip render');
  return (
    <View style={styles.currentTrip}>
      <View style={styles.tripDate}>
        <Text style={styles.todayDate}>
          {today && today.format('LL')} ({today && today.format('dd')})
        </Text>
        <View style={styles.tripPurpose}>
          <TripPurposeButton
            purpose={params.purpose}
            onValueChanged={onTripPurposeChanged}
          />
        </View>
      </View>
      <View style={styles.tripContainer}>
        <TripDetail
          status={params.status}
          startTime={params.startTime}
          currentTime={params.currentTime}
          totalDistance={params.totalDistance}
        />
        <TripAction
          label={params.buttonLabel}
          onPress={params.buttonCallback}
        />
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
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  tripDetail: {
    justifyContent: 'center',
  },
  tripStatusAndDistance: {
    flexDirection: 'row',
  },
  tripBasicText: {
    fontSize: 18,
    backgroundColor: Color.bg1,
    marginVertical: 5,
    marginHorizontal: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tripBoldText: {
    fontWeight: 'bold',
  },
  // button
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.main1,
    // padding: 30,
    width: 120,
    height: 120,
    borderRadius: 30,
  },
  buttonLabel: {
    fontSize: 22,
    color: 'white',
  },
});
