import 'react-native-gesture-handler';
import React from 'react';

import MyStack from './src/screen/stack';

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
    return MyStack();
  }
}
