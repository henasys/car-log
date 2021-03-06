/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {StyleSheet, View, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import Mailer from '../module/mail';
import FileManager from '../module/file';
import Network from '../module/network';
import YearPicker from '../view/yearPicker';
import Picker from '../view/picker';
import {
  bundleLocationJson,
  bundleTripExcel,
  bundleTripDetailExcel,
} from '../module/bundleData';
import MyAlert from '../view/alert';

const makeAttachFile = (filename, type, data, callback = null) => {
  FileManager.writeToMailTemp(filename, data, 'ascii')
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

const sendMail = (realm, email, year, dataType) => {
  console.log('send a mail');
  console.log(email, year);
  if (!email) {
    console.log('not defined email');
    MyAlert.showAlert('Email 미지정', '전송받을 이메일 주소를 입력해주세요.');
    return;
  }
  if (!year) {
    console.log('not defined year');
    MyAlert.showAlert(
      '연도 미지정',
      '전송받을 운행기록의 연도를 입력해주세요.',
    );
    return;
  }
  const callback = (error, event) => {
    if (error) {
      MyAlert.showAlert('Send Mail Error', error);
      return;
    }
  };
  console.log('dataType', dataType);
  let bundle = null;
  switch (dataType) {
    case 'Location':
      bundle = bundleLocationJson(realm, year);
      break;
    case 'TripDetail':
      bundle = bundleTripDetailExcel(realm, year);
      break;
    default:
      bundle = bundleTripExcel(realm, year);
      break;
  }
  makeAttachFile(bundle.filename, bundle.type, bundle.data, attchment => {
    Mailer.sendEmailWithMailer(
      email,
      bundle.subject,
      bundle.body,
      false,
      attchment,
      callback,
    );
  });
};

const dataTypeItems = [
  {label: '운행정보 Excel (국세청 양식)', value: 'Trip'},
  {label: '운행정보 Excel (위치, 시간)', value: 'TripDetail'},
  {label: '위치정보 JSON', value: 'Location'},
];

dataTypeItems.firstValue = () => {
  return dataTypeItems[0].value;
};

export default function ShareScreen(props) {
  const [realm, setRealm] = useState(null);
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('');
  const [pickerItems, setPickerItems] = useState([]);
  const [dataType, setDataType] = useState(dataTypeItems.firstValue());
  const openDatabase = () => {
    Database.open(newRealm => {
      setRealm(newRealm);
      console.log('setRealm() done');
    });
  };
  const closeDatabase = () => {
    Database.close(realm);
  };
  const initStates = () => {
    console.log('initStates');
    if (realm === null) {
      console.log('realm is null');
      return;
    }
    const setting = Database.getSetting(realm);
    if (setting.email) {
      setEmail(setting.email);
    }
    const items = Database.getYearListOfTripForPicker(realm);
    console.log('pickerItems', items);
    setPickerItems(items);
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
    console.log('share useEffect start');
    initTempDir();
    openDatabase();
    return () => {
      console.log('share useEffect cleanup');
      closeDatabase();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    initStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm]);
  console.log('year', year);
  console.log('dataType', dataType);
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
          <YearPicker
            year={year}
            items={pickerItems}
            setYear={value => setYear(value)}
          />
        </View>
        <View paddingVertical={5} />
        <View style={{width: '100%'}}>
          <Picker
            value={dataType}
            items={dataTypeItems}
            onValueChange={value => setDataType(value)}
          />
        </View>
        <View paddingVertical={5} />
        <Icon
          onPress={() => {
            const callback = () => {
              sendMail(realm, email, year, dataType);
            };
            const errorCallback = () => {
              MyAlert.showAlert(
                '인터넷 연결 오류',
                '현재 메일 전송이 가능한 상태가 아닙니다. 와이파이 또는 이동통신 연결을 확인해주세요.',
              );
            };
            Network.checkNetInfo(callback, errorCallback);
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
