<script lang="ts">
	import MonacoWrapper from '$lib/components/MonacoWrapper.svelte';
	import { getContext } from 'svelte';
	import Icon from '@iconify/svelte';

	const store: any = getContext('editor');

	let isDragging = false;
	let editorWidthPercent = 60;
	let container: HTMLDivElement;

	function startDrag() {
		isDragging = true;
	}
	function stopDrag() {
		isDragging = false;
	}
	function onDrag(e: MouseEvent) {
		if (!isDragging || !container) return;
		const containerRect = container.getBoundingClientRect();
		const newWidth = e.clientX - containerRect.left;
		const totalWidth = containerRect.width;
		let percentage = (newWidth / totalWidth) * 100;
		editorWidthPercent = Math.max(20, Math.min(percentage, 80));
	}
</script>

<svelte:window onmouseup={stopDrag} onmousemove={onDrag} />

<div class="split-container" class:dragging={isDragging} bind:this={container}>
	<div class="pane editor-pane" style="width: {editorWidthPercent}%">
		<div class="editor-wrapper">
			<MonacoWrapper setEditorRef={store.setEditorRef} />
		</div>
	</div>

	<div
		class="gutter"
		class:light={store.theme === 'light'}
		onmousedown={startDrag}
		role="separator"
		tabindex="0"
	>
		<div class="grip"></div>
	</div>

	<div class="pane console-pane" style="flex: 1;">
		<div class="console-header" class:light={store.theme === 'light'}>
			<span class="console-title">Console Output</span>
			<button class="clear-btn" onclick={() => store.clearConsole()} title="Clear console">
				<Icon icon="mdi:delete-sweep" width="20" height="20" />
			</button>
		</div>

		<div class="console-content" class:light={store.theme === 'light'}>
			{#each store.logs as log}
				<div class="log-line {log.type}">
					{#if log.type === 'error'}
						<Icon icon="mdi:alert-circle" width="14" class="log-icon" />
					{:else if log.type === 'warn'}
						<Icon icon="mdi:alert" width="14" class="log-icon" />
					{:else if log.type === 'system'}
						<Icon icon="mdi:check" width="14" class="log-icon" />
					{:else}
						<span class="spacer"></span>
					{/if}
					<span class="text">{log.content}</span>
				</div>
			{/each}
			{#if store.logs.length === 0}
				<div class="empty-state">Ready for potatoes...</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.split-container {
		display: flex;
		width: 100%;
		height: 80vh;
		overflow: hidden;
		position: relative;
	}
	.pane {
		height: 100%;
		display: flex;
		flex-direction: column;
		min-width: 200px;
	}
	.editor-wrapper {
		width: 100%;
		height: 100%;
		border: 1px solid #444;
	}
	.gutter {
		width: 20px;
		background: #1c1f26;
		cursor: col-resize;
		display: flex;
		align-items: center;
		justify-content: center;
		border-left: 1px solid #333;
		border-right: 1px solid #333;
	}
	.gutter.light {
		background: #f0f0f0;
		border-color: #ccc;
	}
	.grip {
		width: 2px;
		height: 20px;
		background: #555;
	}
	.console-pane {
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.console-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: #1a1a1a;
		border-bottom: 1px solid #444;
	}
	.console-header.light {
		background: #e8e8e8;
		border-bottom: 1px solid #ccc;
	}
	.console-title {
		font-size: 12px;
		font-weight: bold;
		color: #888;
		text-transform: uppercase;
	}
	.clear-btn {
		background: transparent;
		border: 1px solid #444;
		color: #888;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		padding: 4px;
	}
	.clear-btn:hover {
		background: #ff4444;
		color: white;
		border-color: #ff4444;
	}

	.console-content {
		flex: 1;
		background: #0d1117;
		padding: 10px;
		overflow-y: auto;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
		font-size: 13px;
	}

	.console-content.light {
		background: #ffffff;
	}

	.log-line {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 4px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		color: #e6edf3;
		line-height: 1.5;
	}
	.light .log-line {
		color: #24292f;
		border-bottom-color: rgba(0, 0, 0, 0.05);
	}

	.log-line.error {
		color: #ff7b72;
		background: rgba(255, 0, 0, 0.1);
		padding-left: 5px;
		border-radius: 4px;
	}
	.light .log-line.error {
		color: #cf222e;
		background: #ffebe9;
	}

	.log-line.warn {
		color: #d29922;
	}
	.light .log-line.warn {
		color: #9a6700;
	}

	.log-line.system {
		color: #7d8590;
		font-style: italic;
		font-size: 11px;
		margin-top: 8px;
	}

	.log-icon {
		flex-shrink: 0;
		margin-top: 2px;
	}
	.spacer {
		width: 14px;
		display: inline-block;
		flex-shrink: 0;
	}
	.text {
		white-space: pre-wrap;
		word-break: break-all;
	}

	.empty-state {
		color: #444;
		font-style: italic;
		margin-top: 20px;
		text-align: center;
	}
</style>
