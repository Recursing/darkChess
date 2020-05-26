<script>
  import { BoardState, getPieces, getPossibleMoves, makeMove } from "./chess";
  import WebRTCConnection from "./WebRTCConnection.svelte";
  export let myColor;
  let boardState = new BoardState(myColor);
  let myTurn = myColor === "white";
  let connection;

  function onMessage(message) {
    console.log("Got message");
    console.log(message);
    let [from, to] = message.detail;
    let tr = function(n) {
      return 63 - n;
    };
    boardState = makeMove(boardState, tr(from), tr(to));
    selected = null;
    destinations = [];
    myTurn = true;
  }
  console.log(boardState);

  $: squares = getPieces(boardState);
  function getImage(square) {
    let color = myColor;
    if (square.color === "opponent") {
      color = myColor === "white" ? "black" : "white";
    }
    return `./images/${color}/${square.name}.svg`;
  }
  function onClick(i) {
    if (!myTurn) {
      return;
    }
    if (selected != null && destinations.includes(i)) {
      destinations = [];
      console.log("making move!");
      boardState = makeMove(boardState, selected, i);
      connection.send(JSON.stringify([selected, i]));
      myTurn = false;
      selected = null;
      return;
    }
    if (squares[i].color !== "mine") {
      selected = null;
      destinations = [];
      return;
    }
    selected = i;
    destinations = getPossibleMoves(boardState, i);
  }
  let selected = null;
  let destinations = [];
  function adjacentCoords(i) {
    if (i % 8 == 0) {
      return [i - 8, i - 7, i, i + 1, i + 8, i + 9];
    }
    if (i % 8 == 7) {
      return [i - 8, i - 9, i, i - 1, i + 8, i + 7];
    }
    return [i - 9, i - 8, i - 7, i - 1, i, i + 1, i + 7, i + 8, i + 9];
  }
  $: adjacents = squares.flatMap((s, i) =>
    s.color === "mine" ? adjacentCoords(i) : []
  );
  $: possibleDestinations = squares.flatMap((s, i) =>
    getPossibleMoves(boardState, i)
  );
  $: gameOver = squares.filter(s => s.name === "king").length !== 2;
  $: isVisible = i =>
    gameOver || adjacents.includes(i) || possibleDestinations.includes(i);
</script>

<style>
  #board {
    width: min(80vh, 95vw);
    margin-left: auto;
    margin-right: auto;
    background-color: #dcb;
    height: 0;
    padding-bottom: min(80vh, 95vw);
  }
  .square {
    width: calc(100% / 8);
    float: left;
    user-select: none;
    height: 0;
    padding-bottom: calc(100% / 8);
    transition: opacity 2s;
  }
  .dark {
    background-color: #b58863;
  }
  .light {
    background-color: #f0d9b5;
  }
  .selected {
    box-shadow: 0px 0px 50px 20px rgba(20, 85, 30, 0.6) inset;
    outline: 2px solid;
    outline-color: rgba(0, 0, 0, 0.1);
    outline-offset: -2px;
  }
  .fogged {
    opacity: 0;
  }

  .move-dest {
    box-shadow: 0px 0px 50px 6px rgba(20, 85, 30, 0.3) inset;
  }
  img {
    width: 100%;
    user-select: none;
  }
  h1 {
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    color: #333;
  }
</style>

<WebRTCConnection bind:connection on:onMessage={onMessage} />
{#if connection}
<h1>
  {#if myTurn}Click a piece to play!{:else}Waiting for opponent...{/if}
</h1>
<div id="board">
  {#each squares as square, i}
    <div
      class="square"
      class:dark={Math.floor((i * 9) / 8) % 2}
      class:light={1 - (Math.floor((i * 9) / 8) % 2)}
      class:selected={selected === i}
      class:move-dest={destinations.includes(i)}
      class:fogged={!isVisible(i)}
      on:click={() => onClick(i)}>
      {#if square.color}
        <img
          src={getImage(square)}
          alt={square.name}
          draggable="false"
          ondragstart="return false;" />
      {/if}
    </div>
  {/each}
</div>
{/if}
