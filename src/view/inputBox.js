import React from 'react';
import {Text, View, StyleSheet, TextInput} from 'react-native';

const inputBox = (label, unitLabel, defaultValue, onChangeTextHandler) => {
  return (
    <View style={styles.inputBoxContainer}>
      <Text style={styles.textInputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={text => onChangeTextHandler(text)}
        defaultValue={defaultValue}
      />
      <Text>{unitLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default inputBox;
