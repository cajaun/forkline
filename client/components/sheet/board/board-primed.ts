// resolves once the live board has drawn every kind of shape so the splash can lift over compiled shaders
let markPrimed: () => void = () => {};
export const boardPrimed = new Promise<void>(resolve => {
  markPrimed = resolve;
});

export function markBoardPrimed() {
  markPrimed();
}
