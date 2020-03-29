import React from 'react';

import Database from '../module/database';

export class DatabaseComponent extends React.Component {
  state = {
    realm: null,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount(callback = null) {
    console.log('DatabaseComponent componentDidMount');
    this._openDatabase(callback);
  }

  componentWillUnmount() {
    console.log('DatabaseComponent componentWillUnmount');
    this._closeDatabase();
  }

  _openDatabase(callback = null) {
    console.log('DatabaseComponent _openDatabase');
    Database.open(realm => {
      this.setState({realm});
      callback && callback(realm);
    });
  }

  _closeDatabase() {
    console.log('DatabaseComponent _closeDatabase');
    Database.close(this.state.realm);
  }
}
