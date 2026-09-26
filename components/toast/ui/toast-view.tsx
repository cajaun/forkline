import { ToastFrame } from './toast-frame';
import { ToastTitle, ToastDescription } from './toast-copy';
import { ToastAction } from './toast-action';
import { ToastClose } from './toast-close';

const Toast = Object.assign(ToastFrame, {
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
});

export { DefaultToast } from './default-toast';
export default Toast;
