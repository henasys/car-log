/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, TextInput, FlatList} from 'react-native';
import {Button} from 'react-native-elements';
import {Icon} from 'react-native-elements';

import Database from '../module/database';

export function SettingScreen() {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Setting Screen</Text>
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
