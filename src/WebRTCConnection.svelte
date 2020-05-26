<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let connection = null;
  let out_url = null;

  function connectToInitiator(pid) {
    // Please self host your own signaling server,
    // see https://github.com/peers/peerjs-server
    const peer = new Peer();
    peer.on("open", () => {
      console.log("Peer opened, connecting to:", pid);
      connection = peer.connect(pid);
      connection.on("open", () => {
        connection.on("data", data => {
          console.log("got data:", data);
          dispatch("onMessage", JSON.parse(data));
        });
      });
    });
    peer.on("error", err => {
      console.error(err);
      alert(err);
    });

    peer.on("connection", conn => {
      console.log("CONNECTED!");
      console.log(conn);
    });
  }

  function createInitiator() {
    // Please self host your own signaling server
    // see https://github.com/peers/peerjs-server
    const peer = new Peer();
    peer.on("open", function(id) {
      console.log("My peer ID is: " + id);
      out_url = location.href + "#" + peer.id;
    });

    peer.on("error", err => {
      console.error(err);
      alert(err);
    });

    peer.on("connection", conn => {
      connection = conn;
      console.log("CONNECTED! with connection:");
      console.log(conn);
      conn.on("data", data => {
        console.log("got data:", data);
        dispatch("onMessage", JSON.parse(data));
      });
      conn.on("close", () => {
        console.error("connection closed");
        alert("Connection closed!");
      });
    });
  }

  onMount(async () => {
    const pid = location.hash.slice(1);
    if (pid) {
      console.log("connecting to " + pid);
      connectToInitiator(pid);
    } else {
      console.log("creating initiator peer");
      createInitiator();
    }
  });
</script>

<style>
  p,
  a {
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    color: #333;
  }
</style>

{#if !connection}
  <p>Establishing connection...</p>
  {#if out_url}
    <p>
      Send this link to your opponent:
      <a
        href={out_url}
        on:click|preventDefault={() => navigator.clipboard
            .writeText(out_url)
            .then(() => alert('Link copied! Send it to opponent'))}>
        {out_url}
      </a>
    </p>
  {/if}
{/if}
