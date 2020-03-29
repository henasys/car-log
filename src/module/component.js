import React from 'react';

import Database from '../module/database';

export class DatabaseComponent extends React.Component {
  state = {
    realm: null,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('DatabaseComponent componentDidMount');
    this.openDatabase();
  }

  componentWillUnmount() {
    console.log('DatabaseComponent componentWillUnmount');
    this.closeDatabase();
  }

  openDatabase() {
    Database.open(realm => {
      this.setState({realm});
    });
  }

  closeDatabase() {
    Database.close(this.state.realm);
  }
}
