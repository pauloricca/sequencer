import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from 'components/Button/Button';
import { ButtonProps } from 'components/Button/Button.types';

interface SequencerSortingItemProps extends ButtonProps {
  id: string;
}

export const SequencerSortingItem: React.FC<SequencerSortingItemProps> = ({
  id,
  ...buttonProps
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Button {...buttonProps} />
    </div>
  );
};
