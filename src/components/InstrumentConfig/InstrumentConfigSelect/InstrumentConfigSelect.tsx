import { Button, Menu, MenuItem } from "@blueprintjs/core";
import {
  ItemListRenderer,
  ItemPredicate,
  ItemRenderer,
  Select,
} from "@blueprintjs/select";
import React from "react";
import {
  InstrumentConfigSelectItem,
  InstrumentConfigSelectProps,
} from "./InstrumentConfigSelect.types";

export const InstrumentConfigSelect: React.FC<InstrumentConfigSelectProps> = ({
  items,
  label,
  onSelect,
}) => {
  const renderItem: ItemRenderer<InstrumentConfigSelectItem> = (
    item,
    { handleClick, modifiers }
  ) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={item.key ?? item.label ?? item.value}
        onClick={handleClick}
        text={item.label ?? item.value}
      />
    );
  };

  const filterItem: ItemPredicate<InstrumentConfigSelectItem> = (
    query,
    item
  ) => {
    return (item.label ?? item.value).toLowerCase().indexOf(query.toLowerCase()) >= 0;
  };

  const renderMenu: ItemListRenderer<InstrumentConfigSelectItem> = ({
    items,
    itemsParentRef,
    query,
    renderItem,
    menuProps,
  }) => {
    const renderedItems = items.map(renderItem).filter((item) => item != null);
    return (
      <Menu role="listbox" ulRef={itemsParentRef} {...menuProps}>
        {renderedItems}
      </Menu>
    );
  };

  return (
    <Select<InstrumentConfigSelectItem>
      fill={true}
      filterable={true}
      itemPredicate={filterItem}
      items={items}
      itemListRenderer={renderMenu}
      itemRenderer={renderItem}
      onItemSelect={onSelect}
    >
      <Button text={label} rightIcon="double-caret-vertical" fill={true} />
    </Select>
  );
};
