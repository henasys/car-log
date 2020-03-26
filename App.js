import React from 'react';

import LocationScreen from './src/module/location';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('App constructor');
  }

  componentDidMount() {
    console.log('App componentDidMount');
  }

  componentWillUnmount() {
    console.log('App componentWillUnmount');
  }

  render() {
    console.log('App render');
    return <LocationScreen />;
  }
}
