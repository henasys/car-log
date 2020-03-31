/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import {Icon} from 'react-native-elements';

import Database from '../module/database';
import inputBox from '../view/inputBox';

export default class SettingScreen extends React.Component {
  state = {
    velocity: '1.0',
    period: '15',
    gpsError: '500',
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
      console.log('realm.open() done');
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
    const {velocity, period, gpsError} = setting;
    this.setState({
      velocity: velocity ? String(velocity) : this.state.velocity,
      period: period ? String(period) : this.state.period,
      gpsError: gpsError ? String(gpsError) : this.state.gpsError,
    });
  }

  setVelocity(velocity) {
    this.setState({velocity});
    const {realm, period, gpsError} = this.state;
    Database.saveSetting(realm, velocity, period, gpsError)
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  setPeriod(period) {
    this.setState({period});
    const {realm, velocity, gpsError} = this.state;
    Database.saveSetting(realm, velocity, period, gpsError)
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  setGpsError(gpsError) {
    this.setState({gpsError});
    const {realm, velocity, period} = this.state;
    Database.saveSetting(realm, velocity, period, gpsError)
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const {velocity, period, gpsError} = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>{'출발점 검출 기준'}</Text>
        <View style={styles.inputContainer}>
          {inputBox({
            label: '속도 ≤',
            unitLabel: 'm/s',
            defaultValue: velocity,
            onChangeTextHandler: text => {
              this.setVelocity(text);
              console.log('velocity onChange');
            },
            textInputStyle: styles.textInput,
          })}
          {inputBox({
            label: '시간 ≥',
            unitLabel: 'min',
            defaultValue: period,
            onChangeTextHandler: text => {
              this.setPeriod(text);
              console.log('period onChange');
            },
            textInputStyle: styles.textInput,
          })}
          {inputBox({
            label: ' GPS오차 ≥',
            unitLabel: 'meters     ',
            defaultValue: gpsError,
            onChangeTextHandler: text => {
              this.setGpsError(text);
              console.log('gpsError onChange');
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
      </View>
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
