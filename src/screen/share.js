/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, View, TextInput, Alert} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import Mailer from '../module/mail';
import FileManager from '../module/file';

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

const showAlert = (title, message) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Ok',
      },
    ],
    {cancelable: true},
  );
};

const makeAttachFile = (filename, type, contents, callback = null) => {
  FileManager.writeToMailTemp(filename, contents, 'utf8')
    .then(() => {
      const path = FileManager.getPathOnMailTemp(filename);
      const attchment = Mailer.attchment(path, type, filename);
      console.log('attchment', attchment);
      callback && callback(attchment);
    })
    .catch(e => {
      console.log(e);
    });
};

const sendMail = (email, year) => {
  console.log('send a mail');
  console.log(email, year);
  const subject = 'Greeting!';
  const body = 'Hello, world.';
  const callback = (error, event) => {
    if (error) {
      showAlert('Send Mail Error', error);
      return;
    }
  };
  const filename = 'test.txt';
  const type = 'text';
  const contents = 'this is a text in test.txt file';
  makeAttachFile(filename, type, contents, attchment => {
    Mailer.sendEmailWithMailer(
      email,
      subject,
      body,
      false,
      attchment,
      callback,
    );
  });
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
  const initTempDir = () => {
    FileManager.unlinkMailTempDir()
      .then()
      .catch()
      .finally(() => {
        return FileManager.makeMailTempDir();
      })
      .then(() => {
        return FileManager.readMailTempDir();
      })
      .then(result => {
        console.log('readMailTempDir result', result);
      })
      .catch(e => {
        console.log('FileManager.makeMailTempDir', e);
      });
  };
  useEffect(() => {
    initStates();
    initTempDir();
  }, []);
  const items = yearItems();
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
            items={items}
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
            sendMail(email, year);
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
