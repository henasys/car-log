import {TripDetector} from '../src/module/detector';
import {initEmptyLocation, clone, TimeUtil} from '../src/module/util';

class DetectorInMain {
  constructor() {
    this.tripDetector = initDetector();
  }

  doDetectOnRemainedLocationList(realm, locations, lastTimestamp) {
    if (locations.length === 0) {
      return;
    }
    if (lastTimestamp === 0) {
      this.tripDetector.setPreviousLocation();
    } else {
      this.tripDetector.setPreviousLocation(locations[0]);
    }
    for (let index = 0; index < locations.length; index++) {
      const location = locations[index];
      this.tripDetector.detectAtOnce(location);
    }
    const result = this.tripDetector.getResult();
    console.log('doDetectOnRemainedLocationList result', result);
  }
}

import {locations} from './location/data';

const initDetector = () => {
  const period = '10';
  const accuracyMargin = '40';
  const radiusOfArea = '100';
  const speedMargin = '0';
  const detector = new TripDetector(
    period,
    accuracyMargin,
    radiusOfArea,
    speedMargin,
  );
  return detector;
};

it('detectList', () => {
  const detector = initDetector();
  detector.detectList(locations);
  const result = detector.getResult();
  console.log('result', result);
  expect(result.length).toEqual(3);
  const trip1 = result[0];
  expect(trip1.start.created).toEqual(1586146256849);
  const trip2 = result[1];
  expect(trip2.start.created).toEqual(1586147137405);
  const trip3 = result[2];
  expect(trip3.start.created).toEqual(1586150007714);
});

it('detect_all', () => {
  const detector = initDetector();
  let previous = initEmptyLocation();
  for (let index = 0; index < locations.length; index++) {
    const location = clone(locations[index]);
    previous = detector.detect(location, previous);
  }
  const result = detector.getResult();
  console.log('result', result);
  expect(result.length).toEqual(3);
  const trip1 = result[0];
  expect(trip1.start.created).toEqual(1586146256849);
  const trip2 = result[1];
  expect(trip2.start.created).toEqual(1586147137405);
  const trip3 = result[2];
  expect(trip3.start.created).toEqual(1586150007714);
});

it('detect_each', () => {
  const tripStartCallback = item => {
    console.log(
      'tripStartCallback',
      item.created,
      TimeUtil.timeToDateHourMin(item.created),
    );
  };
  const tripEndCallback = item => {
    console.log(
      'tripEndCallback',
      item.created,
      TimeUtil.timeToDateHourMin(item.created),
    );
  };
  const detector = initDetector();
  // detector.setAllowTripEndAtFirst(true);
  detector.setTripStartCallback(tripStartCallback);
  detector.setTripEndCallback(tripEndCallback);
  let previous = initEmptyLocation();
  for (let index = 0; index < locations.length; index++) {
    const location = clone(locations[index]);
    previous = detector.detect(location, previous);
  }
});

it('detector_in_main', () => {
  const detector = new DetectorInMain();
  detector.doDetectOnRemainedLocationList(null, locations, 0);
});
