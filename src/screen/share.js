/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, View, TextInput} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import {sendEmail} from '../module/mail';

const yearItems = () => {
  const thisYear = new Date().getFullYear();
  const list = [];
  for (let index = 0; index < 5; index++) {
    const year = thisYear - index;
    const yearItem = {};
    yearItem.label = `${year}년`;
    yearItem.value = year;
    list.push(yearItem);
  }
  return list;
};

export function ShareScreen(props) {
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('');
  const initStates = () => {
    console.log('initStates');
    Database.open(realm => {
      const setting = Database.getSetting(realm);
      if (setting.email) {
        setEmail(setting.email);
      }
    });
  };
  useEffect(() => {
    initStates();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputBoxContainer}>
        <TextInput
          style={styles.textInput}
          onChangeText={text => {
            setEmail(text);
          }}
          defaultValue={email}
          placeholder={'abc@example.org'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View paddingVertical={5} />
        <View style={{width: '100%'}}>
          <RNPickerSelect
            style={{
              ...pickerSelectStyles,
              iconContainer: {
                top: 10,
                right: 12,
              },
            }}
            placeholder={{}}
            onValueChange={value => setYear(value)}
            useNativeAndroidPickerStyle={false}
            items={yearItems()}
            Icon={() => {
              return (
                <Icon
                  type="material"
                  name="arrow-drop-down"
                  size={24}
                  color="gray"
                />
              );
            }}
          />
        </View>

        <View paddingVertical={5} />
        <Icon
          onPress={() => {
            console.log('send a mail');
            console.log(email, year);
            const subject = 'Greeting!';
            const body = 'Hello, world.';
            sendEmail(email, subject, body).then(() => {
              console.log('sendEmail done');
            });
          }}
          name="mail-outline"
          type="material"
          size={48}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputBoxContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  textInput: {
    // height: 40,
    width: '100%',
    borderWidth: 0.5,
    borderColor: 'grey',
    marginHorizontal: 10,
    padding: 10,
  },
});

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
