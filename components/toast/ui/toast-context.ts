import { createContext } from '../shared';
import type { ToastContextValue } from '../contracts';

export const [ToastSurfaceProvider, useToastSurface] =
  createContext<ToastContextValue>({
    name: 'ToastSurfaceContext',
  });
