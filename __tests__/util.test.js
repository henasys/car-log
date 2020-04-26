import {yearToTimestamp, combineAddress} from '../src/module/util';

it('yearToTimestamp', () => {
  const input = '2020';
  const expected = 1577804400000;
  const result = yearToTimestamp(input);
  console.log('result', result);
  expect(result).toEqual(expected);
});

it('combineAddress', () => {
  const input = [
    {long_name: '123-456', short_name: '123-456', types: ['premise']},
    {
      long_name: '어느동네',
      short_name: '어느동네',
      types: ['political', 'sublocality', 'sublocality_level_2'],
    },
    {
      long_name: '용산구',
      short_name: '용산구',
      types: ['political', 'sublocality', 'sublocality_level_1'],
    },
    {
      long_name: '서울특별시',
      short_name: '서울특별시',
      types: ['administrative_area_level_1', 'political'],
    },
    {long_name: '대한민국', short_name: 'KR', types: ['country', 'political']},
    {long_name: '789-456', short_name: '789-456', types: ['postal_code']},
  ];
  const expected = '서울특별시 용산구 어느동네 123-456';
  const result = combineAddress(input);
  console.log('result', result);
  expect(result).toEqual(expected);
});
