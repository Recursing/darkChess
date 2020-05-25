const enum BoardInfo {
  PADDING = 2,
  BOARD_SIDE = 8 + 2 * PADDING,
  A8 = BOARD_SIDE * PADDING + PADDING,
  H8 = A8 + 7,
  A1 = A8 + 7 * BOARD_SIDE,
  H1 = A1 + 7,
}

function padPosition(pos: number): number {
  let row = Math.floor(pos / 8);
  let col = pos % 8;
  let padded_row = row + BoardInfo.PADDING;
  let padded_col = col + BoardInfo.PADDING;
  return padded_row * BoardInfo.BOARD_SIDE + padded_col;
}

function unpadPosition(pos: number): number {
  let row = Math.floor(pos / BoardInfo.BOARD_SIDE);
  let col = pos % BoardInfo.BOARD_SIDE;
  let unPaddedRow = row - BoardInfo.PADDING;
  let unPaddedCol = col - BoardInfo.PADDING;
  return unPaddedRow * 8 + unPaddedCol;
}

const enum Direction {
  North = -BoardInfo.BOARD_SIDE,
  East = 1,
  South = BoardInfo.BOARD_SIDE,
  West = -1,
}

const enum Piece {
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King,
  Empty,
}

const enum SquareColor {
  MyPiece,
  OpponentPiece,
  Empty,
  Wall,
}

type PieceName =
  | "pawn"
  | "knight"
  | "bishop"
  | "rook"
  | "queen"
  | "king"
  | null;

function getPieceName(piece: Piece): PieceName {
  switch (piece) {
    case Piece.Pawn:
      return "pawn";
    case Piece.Knight:
      return "knight";
    case Piece.Bishop:
      return "bishop";
    case Piece.Rook:
      return "rook";
    case Piece.King:
      return "king";
    case Piece.Queen:
      return "queen";
    case Piece.Empty:
      return null;
  }
}

function getMoves(piece: Piece): Direction[] {
  switch (piece) {
    case Piece.Pawn:
      return [
        Direction.North,
        Direction.North * 2,
        Direction.North + Direction.West,
        Direction.North + Direction.East,
      ];
    case Piece.Knight:
      return [
        Direction.North + Direction.North + Direction.East,
        Direction.North + Direction.North + Direction.West,
        Direction.West + Direction.West + Direction.North,
        Direction.West + Direction.West + Direction.South,
        Direction.South + Direction.South + Direction.West,
        Direction.South + Direction.South + Direction.East,
        Direction.East + Direction.East + Direction.South,
        Direction.East + Direction.East + Direction.North,
      ];
    case Piece.Bishop:
      return [
        Direction.North + Direction.East,
        Direction.North + Direction.West,
        Direction.West + Direction.South,
        Direction.South + Direction.East,
      ];
    case Piece.Rook:
      return [Direction.North, Direction.West, Direction.South, Direction.East];
    case Piece.Queen:
    case Piece.King:
      return [
        Direction.North,
        Direction.West,
        Direction.South,
        Direction.East,
        Direction.North + Direction.East,
        Direction.North + Direction.West,
        Direction.West + Direction.South,
        Direction.South + Direction.East,
      ];
    case Piece.Empty:
      console.error("Error getting moves from empty piec");
      return [];
  }
}

function isSlider(piece: Piece): boolean {
  return (
    piece === Piece.Bishop || piece === Piece.Rook || piece === Piece.Queen
  );
}

// W for padding, P for opponent pieces, p for my pieces
const InitialColorsStr =
  "\
WWWWWWWWWWWW\
WWWWWWWWWWWW\
WWPPPPPPPPWW\
WWPPPPPPPPWW\
WW        WW\
WW        WW\
WW        WW\
WW        WW\
WWppppppppWW\
WWppppppppWW\
WWWWWWWWWWWW\
WWWWWWWWWWWW";

const INITIAL_COLORS = InitialColorsStr.split("").map((char) => {
  switch (char) {
    case "W":
      return SquareColor.Wall;
    case "P":
      return SquareColor.OpponentPiece;
    case "p":
      return SquareColor.MyPiece;
    case " ":
      return SquareColor.Empty;
    default:
      throw Error("Invalid InitialColorsStr");
  }
});

const InitialPiecesStr =
  "\
WWWWWWWWWWWW\
WWWWWWWWWWWW\
WWRNBQKBNRWW\
WWPPPPPPPPWW\
WW        WW\
WW        WW\
WW        WW\
WW        WW\
WWppppppppWW\
WWrnbqkbnrWW\
WWWWWWWWWWWW\
WWWWWWWWWWWW";

const INITIAL_PIECES = InitialPiecesStr.split("").map((char) => {
  switch (char.toUpperCase()) {
    case "W":
    case " ":
      return Piece.Empty;
    case "P":
      return Piece.Pawn;
    case "R":
      return Piece.Rook;
    case "N":
      return Piece.Knight;
    case "B":
      return Piece.Bishop;
    case "Q":
      return Piece.Queen;
    case "K":
      return Piece.King;
    default:
      throw Error("Invalid InitialPiecesStr");
  }
});

export class BoardState {
  boardPieces: Piece[];
  boardColors: SquareColor[] = INITIAL_COLORS;
  myCastling: [boolean, boolean] = [true, true]; // East - west
  opponentCastling: [boolean, boolean] = [true, true]; // East - west, unused
  enPassant: number | null = null; // square where I can capture en passant
  kingPassant: number | null = null; // square where I could capture the castling king
  constructor(color: "white" | "black") {
    this.boardPieces = INITIAL_PIECES;
    console.log("CONSTRUCTOR", color);
    if (color === "black") {
      this.boardPieces[padPosition(3)] = Piece.King;
      this.boardPieces[padPosition(4)] = Piece.Queen;
      this.boardPieces[padPosition(60)] = Piece.Queen;
      this.boardPieces[padPosition(59)] = Piece.King;
    }
  }
}

export function makeMove(
  boardState: BoardState,
  start: number,
  end: number
): BoardState {
  let paddedStart = padPosition(start);
  let paddedEnd = padPosition(end);
  console.log(start, end);
  boardState.boardPieces[paddedEnd] = boardState.boardPieces[paddedStart];
  boardState.boardColors[paddedEnd] = boardState.boardColors[paddedStart];
  boardState.boardPieces[paddedStart] = Piece.Empty;
  boardState.boardColors[paddedStart] = SquareColor.Empty;
  if (end < 8 && boardState.boardPieces[paddedEnd] == Piece.Pawn) {
    console.log("here");
    boardState.boardPieces[paddedEnd] = Piece.Queen;
  }
  if (start == 0) {
    boardState.opponentCastling[0] = false;
  } else if (start == 7) {
    boardState.opponentCastling[1] = false;
  } else if (start == 63) {
    boardState.myCastling[1] = false;
  } else if (start == 56) {
    boardState.myCastling[0] = false;
  }
  if (boardState.boardPieces[paddedEnd] == Piece.King) {
    if (boardState.boardColors[paddedEnd] == SquareColor.MyPiece) {
      boardState.myCastling = [false, false];
    } else {
      boardState.opponentCastling = [false, false];
    }
  }
  if (
    boardState.boardPieces[paddedEnd] == Piece.King &&
    Math.abs(end - start) == 2
  ) {
    let dir = Math.floor((end - start) / 2);
    boardState.boardPieces[paddedStart + dir] = Piece.Rook;
    boardState.boardColors[paddedStart + dir] =
      boardState.boardColors[paddedEnd];
    if (boardState.boardPieces[paddedEnd + dir] === Piece.Rook) {
      boardState.boardPieces[paddedEnd + dir] = Piece.Empty;
      boardState.boardColors[paddedEnd + dir] = SquareColor.Empty;
    } else if (boardState.boardPieces[paddedEnd + dir + dir] === Piece.Rook) {
      boardState.boardPieces[paddedEnd + dir + dir] = Piece.Empty;
      boardState.boardColors[paddedEnd + dir + dir] = SquareColor.Empty;
    } else {
      console.error("Messed up castling, sorry");
    }
  }
  return boardState;
}

export function getPossibleMoves(
  boardState: BoardState,
  nonPaddedPos: number
): number[] {
  let paddedReachables = getReachableSquares(
    boardState,
    padPosition(nonPaddedPos)
  );
  return paddedReachables.map(unpadPosition);
}

function getReachableSquares(
  boardState: BoardState,
  startPosition: number
): number[] {
  if (boardState.boardColors[startPosition] != SquareColor.MyPiece) {
    return [];
  }
  const pieceMoving = boardState.boardPieces[startPosition];
  const reachableSquares = [];
  for (let moveDirection of getMoves(pieceMoving)) {
    for (let k = 1; k <= 9; k++) {
      let endPosition = startPosition + moveDirection * k;
      let destinationColor = boardState.boardColors[endPosition];
      // Illegal moves

      // Hit board bounds or one of my pieces
      if (
        destinationColor === SquareColor.Wall ||
        destinationColor === SquareColor.MyPiece
      ) {
        break;
      }

      // Illegal pawn moves
      if (pieceMoving == Piece.Pawn) {
        if (
          (moveDirection == Direction.North ||
            moveDirection == Direction.North + Direction.North) &&
          destinationColor != SquareColor.Empty
        ) {
          break; // Can't capture moving up
        }
        if (
          (moveDirection === Direction.North + Direction.West ||
            moveDirection === Direction.North + Direction.East) &&
          destinationColor === SquareColor.Empty &&
          boardState.enPassant !== endPosition &&
          boardState.kingPassant !== endPosition
        ) {
          break; // Can't move diagonally without capturing
        }
        if (
          moveDirection == Direction.North + Direction.North &&
          (startPosition < BoardInfo.A1 + Direction.North ||
            boardState.boardColors[startPosition + Direction.North] !=
              SquareColor.Empty)
        ) {
          break; // Can't move twice unless from second row and with empty square in front
        }
      }

      // Move is probably fine (TODO except king stuff)
      reachableSquares.push(endPosition);

      // Castling stuff
      if (
        pieceMoving == Piece.King &&
        (moveDirection == Direction.East || moveDirection == Direction.West)
      ) {
        if (
          (moveDirection == Direction.East && !boardState.myCastling[0]) ||
          (moveDirection == Direction.West && !boardState.myCastling[1])
        ) {
          break;
        }
        endPosition += moveDirection;
        if (boardState.boardColors[endPosition] !== SquareColor.Empty) {
          break;
        }
        if (
          boardState.boardColors[endPosition + moveDirection] !==
            SquareColor.Empty &&
          boardState.boardPieces[endPosition + moveDirection] !== Piece.Rook
        ) {
          break;
        }
        reachableSquares.push(endPosition);
      }

      // Stop pieces that don't slide
      if (!isSlider(pieceMoving)) {
        break;
      }

      // Stop sliding after capture
      if (destinationColor !== SquareColor.Empty) {
        break;
      }
    }
  }
  return reachableSquares;
}

type SquareDescription = {
  color: "mine" | "opponent" | null;
  name: PieceName;
};

export function getPieces(board: BoardState): SquareDescription[] {
  let squares: SquareDescription[] = [];
  for (let i = 0; i < 64; i++) {
    let padded_pos = padPosition(i);
    let color = board.boardColors[padded_pos];
    let colorName = null as "mine" | "opponent" | null;
    if (color === SquareColor.MyPiece) colorName = "mine";
    else if (color === SquareColor.OpponentPiece) colorName = "opponent";
    squares.push({
      color: colorName,
      name: getPieceName(board.boardPieces[padded_pos]),
    });
  }
  return squares;
}
