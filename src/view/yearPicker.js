import React, {useEffect} from 'react';

import Picker from '../view/picker';

const thisYear = new Date().getFullYear();

export default function YearPicker(props) {
  useEffect(() => {
    props.setYear && props.setYear(thisYear - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  return (
    <Picker value={props.year} onValueChange={props.setYear} items={items} />
  );
}
