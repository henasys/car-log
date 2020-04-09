/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, View, TextInput, Alert} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {Icon} from 'react-native-elements';
import XLSX from 'xlsx';

import Database from '../module/database';
import Mailer from '../module/mail';
import FileManager from '../module/file';
import {timeToMonthDayWeek} from '../module/util';

const thisYear = new Date().getFullYear();

const yearItems = () => {
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

const excelHeader = () => {
  return [
    '사용일자(요일)',
    '부서',
    '성명',
    '주행전 계기판의 거리(km)',
    '주행후 계기판의 거리(km)',
    '주행거리(km)',
    '출.퇴근용(km)',
    '일반업무용(km)',
    '비고',
  ];
};

const excelDataRow = (date, distance) => {
  return [date, '', '', '', '', distance, '', '', ''];
};

const excelData = (realm, year) => {
  const list = Database.getTripListByYear(realm, year);
  const data = [];
  data.push(excelHeader());
  list.forEach(trip => {
    // console.log('trip', trip);
    const date = timeToMonthDayWeek(trip.created);
    const distance = (trip.totalDistance / 1000).toFixed(2);
    data.push(excelDataRow(date, parseFloat(distance)));
  });
  return data;
};

const makeExcel = data => {
  var ws_name = 'Sheet';
  var ws = XLSX.utils.aoa_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  return XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
};

const makeAttachFile = (filename, type, data, callback = null) => {
  const blob = makeExcel(data);
  FileManager.writeToMailTemp(filename, blob, 'ascii')
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

const sendMail = (realm, email, year) => {
  console.log('send a mail');
  console.log(email, year);
  if (!year) {
    console.log('not defined year', year);
    return;
  }
  const subject = `업무용 승용차 운행기록부 ${String(year)}년`;
  const body = '첨부파일 참조바랍니다.';
  const callback = (error, event) => {
    if (error) {
      showAlert('Send Mail Error', error);
      return;
    }
  };
  const filename = 'car-log.xlsx';
  const type = 'xlsx';
  const data = excelData(realm, year);
  // console.log('data', data);
  makeAttachFile(filename, type, data, attchment => {
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
  const [realm, setRealm] = useState(null);
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('');
  const openDatabase = () => {
    Database.open(newRealm => {
      setRealm(newRealm);
    });
  };
  const closeDatabase = () => {
    Database.close(realm);
    setRealm(null);
  };
  const initStates = () => {
    console.log('initStates');
    if (realm === null) {
      return;
    }
    const setting = Database.getSetting(realm);
    if (setting.email) {
      setEmail(setting.email);
    }
    setYear(thisYear);
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
    openDatabase();
    return () => {
      console.log('share useEffect cleanup');
      closeDatabase();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    initStates();
    initTempDir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            value={year}
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
            sendMail(realm, email, year);
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
