/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, TextInput, FlatList} from 'react-native';
import {Button} from 'react-native-elements';
import {Icon} from 'react-native-elements';

import {DatabaseComponent} from '../module/component';
import Database from '../module/database';
import inputBox from '../view/inputBox';

export default class SettingScreen extends DatabaseComponent {
  state = {
    velocity: '1.0',
    period: '15',
    // realm: null,
  };

  componentDidMount() {
    console.log('setting componentDidMount');
    super.componentDidMount();
    // this.openDatabase();
  }

  componentWillUnmount() {
    console.log('setting componentWillUnmount');
    super.componentWillUnmount();
    // this.closeDatabase();
  }

  openDatabase() {
    Database.open(realm => {
      const setting = Database.getSetting(realm);
      if (!setting) {
        this.setState({realm});
        return;
      }
      const {velocity, period} = setting;
      this.setState({
        realm: realm,
        velocity: String(velocity),
        period: String(period),
      });
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
  }

  setVelocity(velocity) {
    this.setState({velocity});
    const {realm, period} = this.state;
    Database.saveSetting(realm, velocity, period)
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  setPeriod(period) {
    this.setState({period});
    const {realm, velocity} = this.state;
    Database.saveSetting(realm, velocity, period)
      .then(setting => {
        console.log(setting);
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const {velocity, period} = this.state;
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
    width: '60%',
    borderWidth: 1,
    marginHorizontal: 10,
    marginVertical: 10,
  },
});
