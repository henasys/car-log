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
});
