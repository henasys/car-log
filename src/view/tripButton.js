import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';

import Color from '../module/color';

export default function TripButton({label, disabled, time, onPress}) {
  let containerStyle = styles.buttonContainer;
  let labelStyle = styles.buttonLabel;
  let timeStyle = styles.buttonTime;
  if (disabled) {
    containerStyle = {...containerStyle, ...{backgroundColor: Color.bg1}};
    labelStyle = {...labelStyle, ...{color: 'grey'}};
    timeStyle = {...timeStyle, ...{color: 'grey'}};
  }
  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={disabled}
      onPress={onPress}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={timeStyle}>{time}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.main1,
    // padding: 30,
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  buttonLabel: {
    fontSize: 22,
    color: 'white',
  },
  buttonTime: {
    fontSize: 16,
    color: 'white',
  },
});
