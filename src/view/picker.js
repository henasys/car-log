import React from 'react';
import {StyleSheet} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {Icon} from 'react-native-elements';

export default function Picker(props) {
  return (
    <RNPickerSelect
      style={{
        ...pickerSelectStyles,
        iconContainer: {
          top: 10,
          right: 12,
        },
      }}
      placeholder={{}}
      value={props.value}
      onValueChange={props.onValueChange}
      useNativeAndroidPickerStyle={false}
      items={props.items}
      Icon={() => {
        return (
          <Icon type="material" name="arrow-drop-down" size={24} color="gray" />
        );
      }}
    />
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: 'gray',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'grey',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
