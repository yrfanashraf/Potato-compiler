<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { getEditorStore } from '$lib/editorStore.svelte';
	import { setContext } from 'svelte';
	import '../app.css';
	import Intro from './Intro.svelte';
	import DeviceBlocker from './DeviceBlocker.svelte';

	const store = getEditorStore();
	setContext('editor', store);

	let showIntro = true;

   function handleDone() {
    showIntro = false;
  }
</script>

<DeviceBlocker/>

{#if showIntro}
	<Intro on:done={handleDone} />
{/if}

<div class="main" class:light={store.theme === 'light'}>
	<Header />
	<Toolbar />
	<slot />
</div>

<style>
	.main {
		background: #1C1F26;
		width: 100vw;
		min-height: 100vh;
		transition: all 0.3s ease;
	}
	.main.light {
		background: #a6a9b2;
	}
</style>
