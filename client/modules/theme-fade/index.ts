import { requireOptionalNativeModule } from 'expo';

type ThemeFadeModule = { cover(duration: number, delay: number): Promise<void> };

const native = requireOptionalNativeModule<ThemeFadeModule>('ThemeFade');

// the system crossfades its own appearance switch so an in app switch gets the same fade
// a build without the native module switches without the fade
export async function coverThemeChange() {
  await native?.cover(0.35, 0.12).catch(() => {});
}
