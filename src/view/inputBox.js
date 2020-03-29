import React from 'react';
import {Text, View, StyleSheet, TextInput} from 'react-native';

const inputBox = props => {
  return (
    <View style={styles.inputBoxContainer}>
      <Text style={styles.textInputLabel}>{props.label}</Text>
      <TextInput
        style={props.textInputStyle ? props.textInputStyle : styles.textInput}
        onChangeText={text => props.onChangeTextHandler(text)}
        defaultValue={props.defaultValue}
      />
      <Text>{props.unitLabel}</Text>
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
    // width: 40,
    borderWidth: 1,
    marginHorizontal: 10,
  },
});

export default inputBox;
