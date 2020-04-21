import React from 'react';
import {Button} from 'react-native-elements';

import Database from '../module/database';

TripTypeButton.getLabel = type => {
  switch (type) {
    case Database.Trip.Type.COMMUTE:
      return '출퇴근';
    case Database.Trip.Type.BUSINESS:
      return '업무';
    case Database.Trip.Type.NON_BUSINESS:
      return '비업무';
    default:
      return '출퇴근';
  }
};

export default function TripTypeButton({type, onValueChanged}) {
  return (
    <Button
      title={TripTypeButton.getLabel(type)}
      type="outline"
      onPress={() => {
        const value = (type + 1) % Object.keys(Database.Trip.Type).length;
        onValueChanged && onValueChanged(value);
      }}
    />
  );
}
