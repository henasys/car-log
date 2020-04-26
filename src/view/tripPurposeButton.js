/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';

import Database from '../module/database';
import Color from '../module/color';

export default function TripPurposeButton({
  purpose,
  onValueChanged,
  keepState,
}) {
  const [purposeValue, setPurposeValue] = useState(
    Database.Trip.PurposeType.COMMUTE,
  );
  const initStates = () => {
    setPurposeValue(purpose);
  };
  useEffect(() => {
    initStates();
  }, []);
  const keepValue = keepState ? purposeValue : purpose;
  return (
    <TouchableOpacity
      style={styles.buttonStyle}
      onPress={() => {
        const value =
          (keepValue + 1) % Object.keys(Database.Trip.PurposeType).length;
        onValueChanged && onValueChanged(value);
        setPurposeValue(value);
      }}>
      <Text style={styles.titleStyle}>
        {Database.Trip.getPurposeTypeLabel(keepValue)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    borderColor: Color.black,
    backgroundColor: Color.bg1,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 4,
  },
  titleStyle: {
    color: Color.black,
    fontWeight: 'bold',
  },
});
