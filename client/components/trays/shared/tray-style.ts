export const TRAY_STEP_OPTIONS = {
  className: 'bg-[#FEFFFF] dark:bg-[#262626]',
  footerClassName: 'bg-[#FEFFFF] dark:bg-[#262626]',
};

export function roundButtonStyle(size: number, backgroundColor: string) {
  return {
    alignItems: 'center' as const,
    backgroundColor,
    borderRadius: size / 2,
    height: size,
    justifyContent: 'center' as const,
    width: size,
  };
}
