import React from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';

import Database from '../module/database';
import color from '../module/color';

export default function TripTypeButton({type, onValueChanged}) {
  return (
    <TouchableOpacity
      style={styles.buttonStyle}
      onPress={() => {
        const value = (type + 1) % Object.keys(Database.Trip.Type).length;
        onValueChanged && onValueChanged(value);
      }}>
      <Text style={styles.titleStyle}>{Database.Trip.getTypeLabel(type)}</Text>
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
