# Toast Notes

Use the root barrel:

```tsx
import { ToastProvider, useToast, Toast } from '@/components/toast';
```

Provider:

```tsx
<ToastProvider>
  <App />
</ToastProvider>
```

Simple announcement:

```tsx
const { toast } = useToast();
toast.show('Copied');
```

Configured announcement:

```tsx
toast.show({
  label: 'Upload complete',
  description: 'The file is available now.',
  variant: 'success',
});
```

Persistent announcement:

```tsx
toast.show({
  label: 'Connection lost',
  description: 'Retry when the network returns.',
  variant: 'warning',
  duration: 'persistent',
});
```

Custom announcement:

```tsx
toast.show({
  component: (props) => (
    <Toast variant="info" {...props}>
      <Toast.Title>Custom title</Toast.Title>
      <Toast.Description>Custom body</Toast.Description>
      <Toast.Close />
    </Toast>
  ),
});
```
