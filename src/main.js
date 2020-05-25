import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: { myColor: location.hash ? "black" : "white" },
});

export default app;
