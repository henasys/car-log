import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {Icon} from 'react-native-elements';

const thisYear = new Date().getFullYear();

export default function YearPicker(props) {
  const [year, setYear] = useState('');
  useEffect(() => {
    if (props.year) {
      setYear(props.year);
    } else {
      setYear(thisYear);
    }
  }, [props.year]);
  const yearItems = () => {
    const yearNum = props.yearNum ? props.yearNum : 5;
    const list = [];
    for (let index = 0; index < yearNum; index++) {
      const yy = thisYear - index;
      const yearItem = {};
      yearItem.label = `${yy}년`;
      yearItem.value = yy;
      list.push(yearItem);
    }
    return list;
  };
  const items = yearItems();
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
      value={year}
      onValueChange={value => {
        setYear(value);
        props.setYear && props.setYear(value);
      }}
      useNativeAndroidPickerStyle={false}
      items={items}
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
