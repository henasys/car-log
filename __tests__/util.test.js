import {yearToTimestamp} from '../src/module/util';

it('yearToTimestamp', () => {
  const input = '2020';
  const expected = 1577804400000;
  const result = yearToTimestamp(input);
  console.log('result', result);
  expect(result).toEqual(expected);
});
