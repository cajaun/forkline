import { memo } from 'react';
import type { ToastEntryProps } from '../contracts';

function ToastEntryView({
  toastItem,
  show,
  hide,
  index,
  total,
  heights,
  maxVisibleToasts,
}: ToastEntryProps) {
  if (typeof toastItem.component !== 'function') {
    throw new Error(
      'Toast entries must render from a function that receives toast props'
    );
  }

  return toastItem.component({
    id: toastItem.id,
    index,
    total,
    heights,
    maxVisibleToasts,
    show,
    hide,
  });
}

export const ToastEntry = memo(
  ToastEntryView,
  (prevProps, nextProps) =>
    prevProps.toastItem.id === nextProps.toastItem.id &&
    prevProps.toastItem.component === nextProps.toastItem.component &&
    prevProps.index === nextProps.index
);

ToastEntry.displayName = 'ToastEntry';
