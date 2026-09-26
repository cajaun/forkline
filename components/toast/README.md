# Toast

Root-mounted feedback system for React Native.

The public surface stays intentionally small:

```tsx
import { ToastProvider, useToast, Toast } from '@/components/toast';
```

## Package Layout

```txt
components/toast/
  index.ts
  base/             low-level accessible RN building blocks
  contracts/        public and internal TypeScript contracts
  motion/           stack movement, entry/exit, and swipe behavior
  presentation/     default colors, typography, slot styles, and theme helpers
  runtime/          queue host, announcements, timers, settings, and portal shell
  shared/           local utility primitives
  ui/               visible toast frame, copy, actions, close control, and defaults
```

## Runtime Flow

`ToastProvider` owns the queue and exposes `toast.show` / `toast.hide`.

`runtime/announce.tsx` normalizes string, config, and custom-render requests into queue entries.

`runtime/toast-store.ts` performs stack transitions.

`runtime/toast-entry.tsx` renders one queue entry with stable props.

`runtime/safe-area-portal.tsx` places the stack above app content.

## Visual Flow

`ui/toast-frame.tsx` owns the animated shell and measurement copy.

`ui/toast-copy.tsx` owns title and description rendering.

`ui/toast-action.tsx` owns action button semantics and feedback animation.

`ui/toast-close.tsx` owns dismiss control behavior.

`ui/default-toast.tsx` composes the built-in layout used by simple `toast.show` calls.

## Usage

```tsx
const { toast } = useToast();

toast.show('Copied');

toast.show({
  label: 'Saved',
  description: 'Your changes are synced.',
  variant: 'success',
});

toast.show({
  duration: 'persistent',
  component: (props) => (
    <Toast variant="info" {...props}>
      <Toast.Title>Heads up</Toast.Title>
      <Toast.Description>Custom content can use the same shell.</Toast.Description>
      <Toast.Close />
    </Toast>
  ),
});
```

## Design Rules

Call sites should ask for feedback; they should not know queue mechanics.

Runtime code should not know visual slot styling beyond rendering entries.

UI pieces should read variant/settings context instead of receiving every slot override by prop.

Motion code should remain independent of copy, icons, actions, and provider state.
