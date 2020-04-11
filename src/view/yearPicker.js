import React, {useState, useEffect} from 'react';

import Picker from '../view/picker';

const thisYear = new Date().getFullYear();

export default function YearPicker(props) {
  const [year, setYear] = useState('');
  useEffect(() => {
    if (props.year) {
      setYear(props.year);
    } else {
      setYearWithProps(thisYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setYearWithProps = value => {
    setYear(value);
    props.setYear && props.setYear(value);
  };
  const yearItems = () => {
    const yearNum = props.yearNum ? props.yearNum : 5;
    const list = [];
    for (let index = 0; index < yearNum; index++) {
      const yy = thisYear - index;
      const yearItem = {};
      yearItem.label = `${yy}년`;
      yearItem.value = yy;
      list.push(yearItem);
    }
    return list;
  };
  const items = yearItems();
  return <Picker value={year} onValueChange={setYearWithProps} items={items} />;
}
