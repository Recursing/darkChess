WebRTC based [Dark Chess](https://en.wikipedia.org/wiki/Dark_chess) chessboard.

Open the page and send the generated link to a friend to play!

Try it [here!](https://buonanno.tech/darkchess/public/index.html)

# TODO

- Testing
- Play around with fog variants:

  - Notified when a piece can be taken
  - Piece in fron of a pawn
  - Pieces around a knight/bishop/rook
  - Pieces near king? (Give king two square vision?)
  - Keep "shadow" vision for squares that were visible last move
  - Show possible boards/values for fogged squares

- Show list of captured pieces
- Drag pieces
- Board letters
- highlight last move
- ...

# Thanks to:

- [Svelte](https://github.com/sveltejs/svelte) for a very noob-friendly way to make declarative web apps
- [Sunfish](https://github.com/thomasahle/sunfish) for a very simple and compact chess logic implementation
- [Peerjs](https://github.com/peers) for simple peer-to-peer webRTC and an easy to set-up signaling server
