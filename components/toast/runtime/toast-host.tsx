import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaPortal } from './safe-area-portal';
import { toastStackReducer } from './toast-store';
import { ToastConfigContext } from './toast-settings';
import { ToastEntry } from './toast-entry';
import { normalizeToastRequest, shouldAutoDismiss } from './announce';
import { toastStyleSheet } from '../presentation';
import type {
  ToastHostContextValue,
  ToastGlobalConfig,
  ToastProviderProps,
  ToastShowOptions,
} from '../contracts';

const ToastHostContext = createContext<ToastHostContextValue | null>(null);

/**
 * Toast provider component
 * Wraps your app to enable toast functionality
 */
export function ToastProvider({
  defaultProps,
  toastOptions,
  insets,
  maxVisibleToasts = 3,
  contentWrapper,
  children,
  disableFullWindowOverlay = false,
}: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastStackReducer, []);

  /**
   * Memoize global config to prevent unnecessary re-renders
   */
  const globalConfig = useMemo<ToastGlobalConfig | undefined>(
    () => ({
      ...defaultProps,
      toastOptions: {
        ...defaultProps?.toastOptions,
        ...toastOptions,
        classNames: {
          ...defaultProps?.toastOptions?.classNames,
          ...toastOptions?.classNames,
        },
        styles: {
          ...defaultProps?.toastOptions?.styles,
          ...toastOptions?.styles,
        },
        variants: {
          ...defaultProps?.toastOptions?.variants,
          ...toastOptions?.variants,
        },
      },
    }),
    [defaultProps, toastOptions]
  );

  const isToastVisible = toasts.length > 0;

  const heights = useSharedValue<Record<string, number>>({});

  const total = useSharedValue<number>(0);

  /**
   * Derive total from toasts.length so the animated opacity/scale/translateY
   * interpolations always use the real count.  Manual increment/decrement
   * was prone to drift when hide + show ran in the same tick or when
   * auto-dismiss raced with a manual hide (stale-closure mismatch).
   */
  useEffect(() => {
    total.set(toasts.length);
  }, [toasts.length, total]);

  const idCounter = useRef(0);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const hideRef = useRef<((ids?: string | string[] | 'all') => void) | null>(
    null
  );

  /**
   * Hide one or more toasts
   * - No argument: hides the last toast in the array
   * - "all": hides all toasts
   * - Single ID: hides that toast
   * - Array of IDs: hides those toasts
   */
  const hide = useCallback(
    (ids?: string | string[] | 'all') => {
      if (ids === undefined) {
        // Hide the last toast in the array
        if (toasts.length > 0) {
          const lastToast = toasts[toasts.length - 1];
          if (!lastToast) return;

          // Clear timeout if exists
          const timeout = timeoutRefs.current.get(lastToast.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutRefs.current.delete(lastToast.id);
          }

          if (lastToast.onHide) {
            lastToast.onHide();
          }

          dispatch({
            type: 'HIDE',
            payload: { ids: [lastToast.id] },
          });

          heights.modify(<T extends Record<string, number>>(value: T): T => {
            'worklet';
            const result = { ...value };
            delete result[lastToast.id];
            return result;
          });
        }
      } else if (ids === 'all') {
        // Clear all timeouts
        timeoutRefs.current.forEach((timeout) => {
          clearTimeout(timeout);
        });
        timeoutRefs.current.clear();

        // Hide all toasts - call onHide for each toast before hiding
        toasts.forEach((toast) => {
          if (toast.onHide) {
            toast.onHide();
          }
        });
        dispatch({ type: 'HIDE_ALL' });
        heights.set({});
      } else {
        // Hide specific toast(s) - call onHide for each toast before hiding
        const idsArray = Array.isArray(ids) ? ids : [ids];
        const idsToRemove = idsArray;
        let removedCount = 0;

        // Find and call onHide callbacks before removing, and clear timeouts
        idsToRemove.forEach((id) => {
          // Clear timeout if exists
          const timeout = timeoutRefs.current.get(id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutRefs.current.delete(id);
          }

          const toast = toasts.find((t) => String(t.id) === String(id));
          if (toast) {
            removedCount++;
            if (toast.onHide) {
              toast.onHide();
            }
          }
        });

        if (removedCount > 0) {
          dispatch({
            type: 'HIDE',
            payload: { ids: idsArray },
          });

          heights.modify(<T extends Record<string, number>>(value: T): T => {
            'worklet';
            const result = { ...value };
            for (const id of idsToRemove) {
              delete result[id];
            }
            return result;
          });
        }
      }
    },
    [heights, toasts]
  );

  // Keep hide ref up to date
  hideRef.current = hide;

  /**
   * Show a toast
   * Supports three usage patterns:
   * 1. Simple string: toast.show('This is toast')
   * 2. Config object: toast.show({ label, variant, ... })
   * 3. Custom component: toast.show({ component: (props) => <Toast>...</Toast> })
   */
  const show = useCallback(
    (options: string | ToastShowOptions): string => {
      const request = normalizeToastRequest(options, globalConfig);
      const id = request.id ?? `toast-${Date.now()}-${idCounter.current++}`;

      if (request.hasExplicitId) {
        const existingToast = toasts.find(
          (toast) => String(toast.id) === String(request.id)
        );
        if (existingToast) {
          return existingToast.id;
        }
      }

      dispatch({
        type: 'SHOW',
        payload: {
          id,
          component: request.component,
          duration: request.duration,
          onShow: request.onShow,
          onHide: request.onHide,
        },
      });

      request.onShow?.();

      if (shouldAutoDismiss(request.duration)) {
        const timeout = setTimeout(() => {
          hideRef.current?.(id);
          timeoutRefs.current.delete(id);
        }, request.duration);
        timeoutRefs.current.set(id, timeout);
      }

      return id;
    },
    [toasts, globalConfig]
  );

  const contextValue = useMemo<ToastHostContextValue>(
    () => ({
      toast: {
        show,
        hide,
      },
      isToastVisible,
    }),
    [show, hide, isToastVisible]
  );

  return (
    <ToastConfigContext.Provider value={globalConfig}>
      <ToastHostContext.Provider value={contextValue}>
        {children}
        {toasts.length > 0 && (
          <SafeAreaPortal
            insets={insets}
            contentWrapper={contentWrapper}
            disableFullWindowOverlay={disableFullWindowOverlay}
          >
            <View style={toastStyleSheet.fill}>
              {toasts.map((toastItem, index) => (
                <ToastEntry
                  key={toastItem.id}
                  toastItem={toastItem}
                  show={show}
                  hide={hide}
                  index={index}
                  total={total}
                  heights={heights}
                  maxVisibleToasts={maxVisibleToasts}
                />
              ))}
            </View>
          </SafeAreaPortal>
        )}
      </ToastHostContext.Provider>
    </ToastConfigContext.Provider>
  );
}

/**
 * Hook to access toast functionality
 *
 * @returns Object containing toast manager and visibility state
 *
 * @example
 * ```tsx
 * const { toast, isToastVisible } = useToast();
 *
 * // Show a toast
 * toast.show({ component: <Toast>Hello</Toast> });
 *
 * // Hide a toast
 * toast.hide('my-toast');
 *
 * // Check if any toast is visible
 * if (isToastVisible) {
 *   console.log('A toast is currently displayed');
 * }
 * ```
 */
export function useToast() {
  const context = useContext(ToastHostContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider provider');
  }

  return {
    toast: context.toast,
    isToastVisible: context.isToastVisible,
  };
}
