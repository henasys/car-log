import React from 'react';
import {Text, View, StyleSheet, TextInput} from 'react-native';
import {Icon} from 'react-native-elements';

import Database from '../module/database';

const inputBox = (label, defaultValue, unit) => {
  return (
    <View style={styles.inputBoxContainer}>
      <Text style={styles.textInputLabel}>{label}</Text>
      <TextInput style={styles.textInput} defaultValue={defaultValue} />
      <Text>{unit}</Text>
    </View>
  );
};

export function StartPositionScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {inputBox('속도 <', '1.0', 'm/s')}
        {inputBox('시간 <', '20', 'min')}
        <Icon
          iconStyle={styles.menuItem}
          onPress={() => {
            console.log('search');
          }}
          name="search"
          type="material"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  inputBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  textInputLabel: {
    fontSize: 16,
  },
  textInput: {
    height: 40,
    width: 40,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
});
