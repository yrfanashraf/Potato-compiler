<script lang="ts">
	import { runCode } from '$lib/runCode';
	import Icon from '@iconify/svelte';
	import tippy from 'tippy.js';
	import { followCursor } from 'tippy.js';
	import 'tippy.js/dist/tippy.css';
	import { getContext, onMount } from 'svelte';
	import LZString from 'lz-string';

	const store: any = getContext('editor');

	let isRunning = $state(false);
	let iconEl: HTMLImageElement;
	let autoRunTimeout: number;
	let showModal = $state<boolean>(false);
	let snippetLabel = $state('');
	let snippetCode = $state('');

	const firstFrame = '/potato-running-first.webp';
	const anim = '/potato-running.webp';

	function handleLang() {
		store.setLang(store.lang === 'js' ? 'ts' : 'js');
	}

	function handleTheme() {
		store.setTheme(store.theme === 'dark' ? 'light' : 'dark');
	}

	async function handleRun() {
		if (!store.editorRef) {
			// Use addLog instead of setConsoleOutput
			store.addLog('warn', '⚠️ Editor not ready yet.');
			return;
		}

		isRunning = true;

		// Brief delay to show the potato start running
		await new Promise((resolve) => setTimeout(resolve, 100));

		try {
			// 1. Get the compiled JavaScript
			const runnableJS = await (store.editorRef as any).compile();

			const proxyEditor = {
				getValue: () => runnableJS
			};

			// 2. Run it - Pass the WHOLE store now, not just one function
			runCode(proxyEditor, store);
		} catch (err) {
			// Use addLog for errors
			store.addLog('error', 'Compilation Error: ' + err);
		}

		await new Promise((resolve) => setTimeout(resolve, 500));
		isRunning = false;
	}

	function handleAutoRunToggle() {
		store.setAutoRun(!store.autoRun);
	}

	function setupAutoRun() {
		if (!store.editorRef) return;

		store.editorRef.onDidChangeModelContent(() => {
			if (!store.autoRun) return;

			if (autoRunTimeout) {
				clearTimeout(autoRunTimeout);
			}

			autoRunTimeout = setTimeout(() => {
				handleRun();
			}, 2000);
		});
	}

	function handleFontSize(e: Event) {
		const val = parseInt((e.target as HTMLInputElement).value);
		if (!isNaN(val)) {
			store.setFontSize(val);
		}
	}
	function saveSnippet() {
		if (snippetLabel && snippetCode) {
			store.addSnippet(snippetLabel, snippetCode);
			snippetLabel = '';
			snippetCode = '';
			showModal = false;
			store.setConsoleOutput(`Snippet added hei! Try typing it in the editor.`);
		}
	}
	function handleShare() {
		if (!store.editorRef) return;

		const code = store.editorRef.getValue();
		const compressed = LZString.compressToEncodedURIComponent(code);

		window.location.hash = compressed;

		const url = window.location.href;
		navigator.clipboard.writeText(url).then(() => {
			store.addLog('system', '🔗 Link copied to clipboard! Share your potato code.');

			const btn = document.querySelector('.share-btn') as HTMLElement;
			if (btn) {
				const originalText = btn.innerHTML;
				btn.innerHTML = 'Copied!';
				setTimeout(() => (btn.innerHTML = originalText), 2000);
			}
		});
	}

	onMount(() => {
		store.setRunCodeCallback(handleRun);
	});

	$effect(() => {
		if (store.editorRef) {
			setupAutoRun();
		}
	});

	$effect(() => {
		if (iconEl) {
			const existing = (iconEl as any)._tippy;
			if (existing) {
				existing.destroy();
			}
			tippy(iconEl, {
				content: `Switch to ${store.lang === 'js' ? 'TypeScript' : 'JavaScript'}`,
				followCursor: true,
				plugins: [followCursor]
			});
		}
	});

	$effect(() => {
		tippy('.theme-icon', {
			content: 'Toggle theme!',
			followCursor: true,
			plugins: [followCursor]
		});
		tippy('.potato-stage', {
			content: 'Re-runnn! (or Ctrl+Enter)',
			followCursor: true,
			plugins: [followCursor]
		});
		tippy('.tada-btn', {
			content: 'Tadaaaaaaaaa!',
			followCursor: true,
			animation: 'tada',
			plugins: [followCursor]
		});
		tippy('.snippet-btn', {
			content: 'Code in your own way!',
			followCursor: true,
			plugins: [followCursor]
		});
		tippy('.tada-btn', {
			content: 'clicking wont do anthng',
			trigger: 'click'
		});
		tippy('.share-btn', { content: 'Share URL', followCursor: true, plugins: [followCursor] });
	});

	$effect(() => {
		const autoRunBtn = document.querySelector('.auto-run-btn');
		if (autoRunBtn) {
			const existing = (autoRunBtn as any)._tippy;
			if (existing) {
				existing.destroy();
			}

			tippy(autoRunBtn, {
				content: store.autoRun ? 'Auto-run ON (runs 2s after typing)' : 'Auto-run OFF',
				followCursor: true,
				plugins: [followCursor]
			});
		}
	});
</script>

{#if showModal}
	<div class="modal-overlay" onclick={() => (showModal = false)}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h3>✨ New Magic Spell (Snippet)</h3>

			<div class="input-group">
				<label>Trigger Word</label>
				<input type="text" placeholder="e.g. log" bind:value={snippetLabel} />
			</div>

			<div class="input-group">
				<label>The Code ($1, $2 for cursor positions)</label>
				<textarea placeholder="e.g. console.log('$1');" bind:value={snippetCode} rows="4"
				></textarea>
			</div>

			<div class="actions">
				<button class="cancel" onclick={() => (showModal = false)}>Cancel</button>
				<button class="save" onclick={saveSnippet}>Save it!</button>
			</div>
		</div>
	</div>
{/if}

<div class="main-container" class:light={store.theme === 'light'}>
	<div class="group left">
		<div class="tool-pill font-control" title="Font Size">
			<Icon icon="mdi:format-size" width="18" height="18" class="font-icon" />
			<input type="number" min="8" max="32" value={store.fontSize} oninput={handleFontSize} />
		</div>

		<div
			class="tool-pill lang-switch"
			onclick={handleLang}
			role="button"
			tabindex="0"
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLang()}
		>
			<img
				bind:this={iconEl}
				class="icon-img"
				src={store.lang === 'js' ? '/js-icon.png' : '/ts-icon.png'}
				alt="js-icon"
			/>
		</div>

		<div
			class="tool-pill theme-icon"
			onclick={handleTheme}
			tabindex="0"
			role="button"
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTheme()}
		>
			<Icon
				icon={store.theme === 'dark' ? 'entypo:light-up' : 'ph:moon-fill'}
				width="24"
				height="24"
			/>
		</div>
	</div>

	<div
		class="potato-stage"
		class:running={isRunning}
		tabindex="0"
		role="button"
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleRun()}
		onclick={handleRun}
	>
		<img class="potato-img" alt="potato" src={isRunning ? anim : firstFrame} />
	</div>

	<div class="group right">
		<button
			class="action-btn auto-run-btn"
			class:active={store.autoRun}
			onclick={handleAutoRunToggle}
		>
			<Icon
				icon={store.autoRun ? 'mdi:lightning-bolt' : 'mdi:lightning-bolt-outline'}
				width="18"
				height="18"
			/>
			<span>Auto</span>
		</button>
		<button class="action-btn share-btn" onclick={handleShare}>
			<Icon icon="mdi:share-variant" width="18" />
			<span>Share</span>
		</button>

		<button class="action-btn snippet-btn" onclick={() => (showModal = !showModal)}>
			<Icon icon="mdi:code-braces" width="18" />
			<span>Snippet</span>
		</button>

		<button class="action-btn tada-btn"> 🎉 Tada </button>
	</div>
</div>

<style>
	.share-btn {
		background: #8b5cf6;
		color: white;
		box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
	}
	.share-btn:hover {
		background: #7c3aed;
	}
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2000;
		animation: fadeIn 0.2s ease-out;
	}

	.modal {
		background: #2a2f3a;
		padding: 28px;
		border-radius: 16px;
		width: 420px;
		border: 1px solid #444;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
		color: white;
		transform: scale(0.95);
		animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	.modal h3 {
		margin: 0 0 24px 0;
		font-size: 1.4rem;
		background: linear-gradient(90deg, #fff, #bbb);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.input-group {
		margin-bottom: 20px;
	}

	.input-group label {
		display: block;
		margin-bottom: 8px;
		font-size: 0.85rem;
		color: #aaa;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.input-group input,
	.input-group textarea {
		width: 100%;
		padding: 12px;
		background: #1c1f26;
		border: 2px solid #333;
		color: white;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.input-group input:focus,
	.input-group textarea:focus {
		border-color: #55b9f3;
		outline: none;
		box-shadow: 0 0 0 3px rgba(85, 185, 243, 0.2);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 24px;
	}

	.actions button {
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: bold;
		border: none;
		cursor: pointer;
		transition: transform 0.1s;
	}

	.actions button:active {
		transform: scale(0.95);
	}
	.cancel {
		background: transparent;
		color: #aaa;
		border: 1px solid #444 !important;
	}
	.save {
		background: #55b9f3;
		color: #111;
	}

	.main-container {
		height: 60px;
		background: #1e293b;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 20px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		transition: background 0.3s ease;
		position: relative;
		z-index: 100;
	}

	.main-container.light {
		background: #f1f5f9; /* Soft gray-white */
		border-bottom: 1px solid #e2e8f0;
	}

	.group {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
	}

	.group.right {
		justify-content: flex-end;
	}
	.group.left {
		justify-content: flex-start;
	}

	.tool-pill {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #334155;
		border-radius: 99px;
		padding: 6px 12px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid transparent;
		color: #e2e8f0;
	}

	.tool-pill:hover {
		background: #475569;
		transform: translateY(-2px);
	}

	.light .tool-pill {
		background: #ffffff;
		color: #475569;
		border: 1px solid #cbd5e1;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.light .tool-pill:hover {
		background: #f8fafc;
		border-color: #94a3b8;
	}

	.font-control input {
		width: 32px;
		background: transparent;
		border: none;
		color: inherit;
		font-size: 14px;
		font-weight: bold;
		text-align: center;
		outline: none;
		margin-left: 4px;
		font-family: cursive;
	}

	.font-control input::-webkit-outer-spin-button,
	.font-control input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.icon-img {
		width: 20px;
		height: 20px;
		object-fit: contain;
	}

	.potato-stage {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 64px;
		height: 64px;
		background: #0f172a;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: 4px solid #334155;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		z-index: 10;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.light .potato-stage {
		background: #ffffff;
		border-color: #e2e8f0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.potato-stage:hover {
		transform: translate(-50%, -50%) scale(1.1);
		border-color: #55b9f3;
		box-shadow: 0 0 20px rgba(85, 185, 243, 0.4);
	}

	.potato-stage:active {
		transform: translate(-50%, -50%) scale(0.95);
	}

	.potato-stage.running {
		border-color: #22c55e;
		box-shadow: 0 0 25px rgba(34, 197, 94, 0.5);
	}

	.potato-img {
		width: 42px;
		height: 42px;
		object-fit: contain;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 700;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		height: 36px;
		font-family: cursive;
	}

	.action-btn:hover {
		transform: translateY(-2px);
	}
	.action-btn:active {
		transform: translateY(0);
	}

	.auto-run-btn {
		background: transparent;
		color: #94a3b8;
		border: 2px dashed #475569;
	}

	.light .auto-run-btn {
		color: #64748b;
		border-color: #cbd5e1;
	}

	.auto-run-btn.active {
		background: #22c55e;
		color: #052e16;
		border: 2px solid #22c55e;
		box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
	}

	.snippet-btn {
		background: #3b82f6;
		color: white;
		box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
	}
	.snippet-btn:hover {
		background: #2563eb;
	}

	.tada-btn {
		background: linear-gradient(135deg, #a855f7, #ec4899);
		color: white;
		box-shadow: 0 4px 10px rgba(236, 72, 153, 0.3);
	}
	.tada-btn:hover {
		filter: brightness(1.1);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes popIn {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	:global(.tippy-box[data-animation='tada'][data-state='hidden']) {
		opacity: 0;
		transform: scale(0.5);
	}
	:global(.tippy-box[data-animation='tada'][data-state='visible']) {
		opacity: 1;
		transform: scale(1);
		animation: tada 0.5s;
	}

	@keyframes tada {
		0% {
			transform: scale(1);
		}
		10%,
		20% {
			transform: scale(0.9) rotate(-3deg);
		}
		30%,
		50%,
		70%,
		90% {
			transform: scale(1.1) rotate(3deg);
		}
		40%,
		60%,
		80% {
			transform: scale(1.1) rotate(-3deg);
		}
		100% {
			transform: scale(1) rotate(0);
		}
	}
</style>
