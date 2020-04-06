import {TripDetector} from '../src/module/detector';
import {locations} from './location/data';

it('detectList', () => {
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
