/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';

import Database from '../module/database';
import color from '../module/color';

export default function TripTypeButton({type, onValueChanged, keepState}) {
  const [typeValue, setTypeValue] = useState(Database.Trip.Type.COMMUTE);
  const initStates = () => {
    setTypeValue(type);
  };
  useEffect(() => {
    initStates();
  }, []);
  const keepValue = keepState ? typeValue : type;
  return (
    <TouchableOpacity
      style={styles.buttonStyle}
      onPress={() => {
        const value = (keepValue + 1) % Object.keys(Database.Trip.Type).length;
        onValueChanged && onValueChanged(value);
        setTypeValue(value);
      }}>
      <Text style={styles.titleStyle}>
        {Database.Trip.getTypeLabel(keepValue)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    borderColor: color.black,
    backgroundColor: color.bg1,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 4,
  },
  titleStyle: {
    color: color.black,
    fontWeight: 'bold',
  },
});
