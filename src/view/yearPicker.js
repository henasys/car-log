import React, {useEffect} from 'react';

import Picker from '../view/picker';

const thisYear = new Date().getFullYear();

export default function YearPicker(props) {
  useEffect(() => {
    props.setYear && props.setYear(thisYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const yearItems = () => {
    const itemCount = props.itemCount ? props.itemCount : 5;
    const list = [];
    for (let index = 0; index < itemCount; index++) {
      const yy = thisYear - index;
      const item = {};
      item.label = `${yy}년`;
      item.value = yy;
      list.push(item);
    }
    return list;
  };
  const items = props.items ? props.items : yearItems();
  return (
    <Picker value={props.year} onValueChange={props.setYear} items={items} />
  );
}
