import React, {useEffect} from 'react';

import Picker from './picker';

const thisMonth = new Date().getMonth();

export default function MonthPicker(props) {
  useEffect(() => {
    props.setMonth && props.setMonth(thisMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const monthItems = () => {
    const itemCount = 12;
    const list = [];
    for (let index = 0; index < itemCount; index++) {
      const mm = index + 1;
      const item = {};
      item.label = `${mm}월`;
      item.value = index;
      list.push(item);
    }
    return list;
  };
  const items = monthItems();
  return (
    <Picker value={props.month} onValueChange={props.setMonth} items={items} />
  );
}
