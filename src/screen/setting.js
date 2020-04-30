import React from 'react';
import {Text, View, StyleSheet, TextInput, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import Database from '../module/database';
import inputBox from '../view/inputBox';
import {checkAndAssign} from '../module/util';

export default class SettingScreen extends React.Component {
  state = {
    period: '0',
    accuracyMargin: '0',
    radiusOfArea: '0',
    speedMargin: '0',
    email: null,
  };

  componentDidMount() {
    console.log('setting componentDidMount');
    this.openDatabase();
  }

  componentWillUnmount() {
    console.log('setting componentWillUnmount');
    this.closeDatabase();
  }

  openDatabase() {
    Database.open(realm => {
      this.setState({realm}, () => {
        this.initStates();
      });
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
  }

  initStates() {
    const {realm} = this.state;
    if (!realm) {
      return;
    }
    const setting = Database.getSetting(realm);
    if (!setting) {
      return;
    }
    const {period, accuracyMargin, radiusOfArea, speedMargin} = this.state;
    this.setState({
      period: checkAndAssign(String(setting.period), period),
      accuracyMargin: checkAndAssign(
        String(setting.accuracyMargin),
        accuracyMargin,
      ),
      radiusOfArea: checkAndAssign(String(setting.radiusOfArea), radiusOfArea),
      speedMargin: checkAndAssign(String(setting.speedMargin), speedMargin),
      email: setting.email,
    });
  }

  setAccuracyMargin(accuracyMargin) {
    if (!accuracyMargin) {
      return;
    }
    this.setState({accuracyMargin});
  }

  setPeriod(period) {
    if (!period) {
      return;
    }
    this.setState({period});
  }

  setRadiusOfArea(radiusOfArea) {
    if (!radiusOfArea) {
      return;
    }
    this.setState({radiusOfArea});
  }

  setSpeedMargin(speedMargin) {
    if (!speedMargin) {
      return;
    }
    this.setState({speedMargin});
  }

  setEmail(email) {
    if (!email) {
      return;
    }
    this.setState({email});
  }

  saveSetting(setting) {
    const {realm} = this.state;
    const {
      period,
      accuracyMargin,
      radiusOfArea,
      speedMargin,
      email,
    } = this.state;
    Database.saveSetting(
      realm,
      checkAndAssign(setting.period, period),
      checkAndAssign(setting.accuracyMargin, accuracyMargin),
      checkAndAssign(setting.radiusOfArea, radiusOfArea),
      checkAndAssign(setting.speedMargin, speedMargin),
      checkAndAssign(setting.email, email),
    )
      .then(newSetting => {
        console.log(newSetting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const {
      period,
      accuracyMargin,
      radiusOfArea,
      speedMargin,
      email,
    } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.sectionLabel}>{'데이터 전송 이메일'}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              onChangeText={text => {
                this.setEmail(text);
              }}
              onEndEditing={() => {
                this.saveSetting({email});
              }}
              onSubmitEditing={({nativeEvent}) => {
                this.saveSetting({email});
              }}
              defaultValue={email}
              placeholder={'abc@example.org'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.sectionLabel}>{'출발점 검출 기준'}</Text>
          <View style={styles.inputContainer}>
            {inputBox({
              label: '영역반경 ≤',
              unitLabel: 'm',
              defaultValue: radiusOfArea,
              onChangeText: text => {
                this.setRadiusOfArea(text);
                console.log('radiusOfArea onChange', text);
              },
              onEndEditing: () => {
                this.saveSetting({radiusOfArea});
              },
              onSubmitEditing: ({nativeEvent}) => {
                this.saveSetting({radiusOfArea});
              },
              textInputStyle: styles.textInput,
            })}
            {inputBox({
              label: '정차시간 ≥',
              unitLabel: '분',
              defaultValue: period,
              onChangeText: text => {
                this.setPeriod(text);
                console.log('period onChange', text);
              },
              onEndEditing: () => {
                this.saveSetting({period});
              },
              onSubmitEditing: ({nativeEvent}) => {
                this.saveSetting({period});
              },
              textInputStyle: styles.textInput,
            })}
            {inputBox({
              label: 'Accuracy ≤',
              unitLabel: 'm',
              defaultValue: accuracyMargin,
              onChangeText: text => {
                this.setAccuracyMargin(text);
                console.log('accuracyMargin onChange', text);
              },
              onEndEditing: () => {
                this.saveSetting({accuracyMargin});
              },
              onSubmitEditing: ({nativeEvent}) => {
                this.saveSetting({accuracyMargin});
              },
              textInputStyle: styles.textInput,
            })}
            {inputBox({
              label: 'GPS Speed ≥',
              unitLabel: 'm/s',
              defaultValue: speedMargin,
              onChangeText: text => {
                this.setSpeedMargin(text);
                console.log('speedMargin onChange', text);
              },
              onEndEditing: () => {
                this.saveSetting({speedMargin});
              },
              onSubmitEditing: ({nativeEvent}) => {
                this.saveSetting({speedMargin});
              },
              textInputStyle: styles.textInput,
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 18,
    marginTop: 10,
    marginHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  itemColumnContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  textInput: {
    height: 40,
    width: '50%',
    borderWidth: 1,
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 10,
  },
});
