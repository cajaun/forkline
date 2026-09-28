# Reference chess pieces

These transparent PNGs are independent redraws of the six silhouettes from the supplied board reference. They were generated from the visual design cues, then normalized to a consistent 512×512 transparent canvas; the screenshot pixels are not used in these assets.

- Individual files are 512×512: `black/{rook,bishop,queen,king,knight,pawn}.png` and `gray/{...}.png`.
- Fill colors are `#070707` for black and `#BABABA` for gray.
- `orange/king.png` is a 512×512 checkmate/move-required king in `#FD8223`.
- `red/king.png` is a 512×512 game-over/checkmate king in `#FF3F43`.
- `black-atlas.png` and `gray-atlas.png` are 3072×512, ordered left to right as rook, bishop, queen, king, knight, pawn.
- `chess-pieces-atlas.png` is the 3072×1024 two-row atlas: black first, gray second.
- The piece artwork is centered on each 512×512 cell with transparent padding for direct board-cell use.
- All six silhouettes are normalized to the same 352 px visible height inside their 512×512 cells.
