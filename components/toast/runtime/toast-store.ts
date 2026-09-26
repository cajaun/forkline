import type { ToastStackEvent, ToastRecord } from '../contracts';

export function toastStackReducer(
  state: ToastRecord[],
  action: ToastStackEvent
): ToastRecord[] {
  switch (action.type) {
    case 'SHOW': {
      const filtered = state.filter((toast) => toast.id !== action.payload.id);
      return [...filtered, action.payload];
    }

    case 'HIDE': {
      return state.filter(
        (toast) =>
          !action.payload.ids.some((id) => String(id) === String(toast.id))
      );
    }

    case 'HIDE_ALL':
      return [];

    default:
      return state;
  }
}
