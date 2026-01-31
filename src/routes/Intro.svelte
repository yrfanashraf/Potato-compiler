<script>
	import { createEventDispatcher } from "svelte";

 const dispatch = createEventDispatcher();

    let showText = false;
  let visible = true;

  setTimeout(() => showText = true, 300);
  setTimeout(() => showText = false, 2000);


  setTimeout(() => {
    visible = false;
  }, 2600);


  setTimeout(() => {
    dispatch("done");
  }, 3400);
</script>

<div class="overlay" class:hide={!visible}>
  <p class:visible={showText}>
    The only limit is your imagination...
  </p>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: #1C1F26;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.7s ease;
    z-index: 999;
  }

  .overlay.hide {
    opacity: 0;
    pointer-events: none;
  }

  p {
    color: white;
    font-size: 1.6rem;
    font-family: cursive;
    letter-spacing: .2em;
    opacity: 0;
    transition: all .8s ease .1s;
     transform: scale(0.95);
  }

  p.visible {
    opacity: 1;
    transform: scale(1);
  }
</style>
