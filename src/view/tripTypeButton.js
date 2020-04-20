import React from 'react';
import {Button} from 'react-native-elements';

import Database from '../module/database';

const getTitle = type => {
  switch (type) {
    case Database.Trip.Type.COMMUTE:
      return '출퇴근';
    case Database.Trip.Type.BUSINESS:
      return '업무';
    case Database.Trip.Type.NON_BUSINESS:
      return '비업무';
  }
};

export default function TripTypeButton({type, onValueChanged}) {
  return (
    <Button
      title={getTitle(type)}
      type="outline"
      onPress={() => {
        const value = (type + 1) % 3;
        onValueChanged && onValueChanged(value);
      }}
    />
  );
}
