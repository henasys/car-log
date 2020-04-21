import React from 'react';
import {Button} from 'react-native-elements';

import Database from '../module/database';

export default function TripTypeButton({type, onValueChanged}) {
  return (
    <Button
      title={Database.Trip.getTypeLabel(type)}
      type="outline"
      onPress={() => {
        const value = (type + 1) % Object.keys(Database.Trip.Type).length;
        onValueChanged && onValueChanged(value);
      }}
    />
  );
}
