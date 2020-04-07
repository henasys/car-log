/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, View, StyleSheet, SafeAreaView} from 'react-native';
import {Button} from 'react-native-elements';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import inputBox from '../view/inputBox';

export default class SettingScreen extends React.Component {
  state = {
    period: '0',
    accuracyMargin: '0',
    radiusOfArea: '0',
    speedMargin: '0',
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
      this.setState({realm});
      this.initStates();
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
    const {period, accuracyMargin, radiusOfArea, speedMargin} = setting;
    this.setState({
      period: period ? String(period) : this.state.period,
      accuracyMargin: accuracyMargin
        ? String(accuracyMargin)
        : this.state.accuracyMargin,
      radiusOfArea: radiusOfArea
        ? String(radiusOfArea)
        : this.state.radiusOfArea,
      speedMargin: speedMargin ? String(speedMargin) : this.state.speedMargin,
    });
  }

  setAccuracyMargin(accuracyMargin) {
    if (!accuracyMargin) {
      return;
    }
    this.setState({accuracyMargin});
    const {realm, period, radiusOfArea, speedMargin} = this.state;
    Database.saveSetting(
      realm,
      period,
      accuracyMargin,
      radiusOfArea,
      speedMargin,
    )
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  setPeriod(period) {
    if (!period) {
      return;
    }
    this.setState({period});
    const {realm, accuracyMargin, radiusOfArea, speedMargin} = this.state;
    Database.saveSetting(
      realm,
      period,
      accuracyMargin,
      radiusOfArea,
      speedMargin,
    )
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  setRadiusOfArea(radiusOfArea) {
    if (!radiusOfArea) {
      return;
    }
    this.setState({radiusOfArea});
    const {realm, period, accuracyMargin, speedMargin} = this.state;
    Database.saveSetting(
      realm,
      period,
      accuracyMargin,
      radiusOfArea,
      speedMargin,
    )
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  setSpeedMargin(speedMargin) {
    if (!speedMargin) {
      return;
    }
    this.setState({speedMargin});
    const {realm, period, accuracyMargin, radiusOfArea} = this.state;
    Database.saveSetting(
      realm,
      period,
      accuracyMargin,
      radiusOfArea,
      speedMargin,
    )
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const {period, accuracyMargin, radiusOfArea, speedMargin} = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.sectionLabel}>{'출발점 검출 기준'}</Text>
        <View style={styles.inputContainer}>
          {inputBox({
            label: '영역반경 ≤',
            unitLabel: 'm',
            defaultValue: radiusOfArea,
            onChangeTextHandler: text => {
              this.setRadiusOfArea(text);
              console.log('radiusOfArea onChange');
            },
            textInputStyle: styles.textInput,
          })}
          {inputBox({
            label: '정차시간 ≥',
            unitLabel: '분',
            defaultValue: period,
            onChangeTextHandler: text => {
              this.setPeriod(text);
              console.log('period onChange');
            },
            textInputStyle: styles.textInput,
          })}
          {inputBox({
            label: 'Accuracy ≤',
            unitLabel: 'm',
            defaultValue: accuracyMargin,
            onChangeTextHandler: text => {
              this.setAccuracyMargin(text);
              console.log('accuracyMargin onChange');
            },
            textInputStyle: styles.textInput,
          })}
          {inputBox({
            label: 'GPS Speed ≤',
            unitLabel: 'm/s',
            defaultValue: speedMargin,
            onChangeTextHandler: text => {
              this.setSpeedMargin(text);
              console.log('speedMargin onChange');
            },
            textInputStyle: styles.textInput,
          })}
        </View>
        <Text style={styles.sectionLabel}>{'데이터 삭제'}</Text>
        <View style={{margin: 10}} />
        <Button
          icon={<Icon name="delete" type="material" size={24} color="white" />}
          title="Delete Car Logs"
          onPress={() => {
            Database.clearAllDatabase()
              .then(() => {
                console.log('');
              })
              .catch(e => {
                console.log(e);
              });
          }}
        />
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
  },
});
