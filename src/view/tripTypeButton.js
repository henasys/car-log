import React, {useState} from 'react';
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

export default function TripTypeButton(props) {
  const [tripType, setTripType] = useState(Database.Trip.Type.COMMUTE);
  return (
    <Button title={getTitle(tripType)} type="outline" onPress={() => {}} />
  );
}
