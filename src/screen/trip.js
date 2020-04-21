import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, SafeAreaView} from 'react-native';
import Geocoder from 'react-native-geocoding';
import {REACT_APP_GOOGLE_API_KEY} from 'react-native-dotenv';

export default function TripScreen(props) {
  const initGeocoder = () => {
    const options = {language: 'ko'};
    Geocoder.init(REACT_APP_GOOGLE_API_KEY, options);
    const start = {latitude: 37.48491, longitude: 126.898931};
    Geocoder.from(start)
      .then(json => {
        console.log(json);
      })
      .catch(e => {
        console.log('Geocoder error', e);
      });
  };
  useEffect(() => {
    initGeocoder();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text>TripScreen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
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
});
