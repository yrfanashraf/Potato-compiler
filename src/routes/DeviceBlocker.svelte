<script>
  let isMobile = false;

  const checkDevice = () => {
    isMobile = window.innerWidth < 1024; // tweak if needed
  };

  checkDevice();
  window.addEventListener("resize", checkDevice);
</script>

{#if isMobile}
  <div class="blocker">
    <h1>Are you serious rn bruh?🥔</h1>
<p>
  bro tried to open a compiler on a phone 💀</p>
 <p>respect the hustle!</p>
<p> grab a laptop tho 💻</p>
  </div>
{/if}

<style>
  .blocker {
    position: fixed;
    inset: 0;
    background: #1C1F26;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 9999;
    padding: 2rem;
    animation: fadeIn .5s ease;
  }
  @keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}
  h1 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    font-family: cursive;
  }

  p {
    opacity: 0.8;
    margin: 0;
    font-family: cursive;
    /* line-height: 1.6; */
  }
</style>
