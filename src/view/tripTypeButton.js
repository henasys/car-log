import React from 'react';
import {StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';

import Database from '../module/database';
import color from '../module/color';

export default function TripTypeButton({type, onValueChanged}) {
  return (
    <Button
      title={Database.Trip.getTypeLabel(type)}
      type="outline"
      buttonStyle={styles.buttonStyle}
      titleStyle={styles.titleStyle}
      onPress={() => {
        const value = (type + 1) % Object.keys(Database.Trip.Type).length;
        onValueChanged && onValueChanged(value);
      }}
    />
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    borderColor: color.black,
    backgroundColor: color.bg1,
    borderWidth: 0.5,
    borderRadius: 20,
  },
  titleStyle: {
    color: color.black,
    fontWeight: 'bold',
  },
});
