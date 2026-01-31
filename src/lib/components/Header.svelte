<script lang="ts">
	import Icon from '@iconify/svelte';
	import { getContext } from 'svelte';

	const store: any = getContext('editor');
</script>

<div class="main-container" class:light={store.theme === 'light'}>
	<div class="image">
		<a href="https://yrfanashraf.vercel.app/" target="_blank">
			<Icon icon="noto:potato" width="60" height="60" />
		</a>
	</div>
	<div class="icons">
		<div class="icon">
			<a target="_blank" href="https://postcards.mono.studio/share/?token=72ddd5bc107954b6b33e86c9aa4502c6b5dd12b8e147e4ef299d606aa5abc16d">🥔</a>
		</div>
		<div class="icon">
			<a target="_blank" href="https://github.com/yrfanashraf"><img src="/github-icon.webp" alt="github icon"></a>
		</div>
		<div class="icon">
			<a target="_blank" href="https://www.instagram.com/yrfanashraf/"><img src="/instagram-icon.png" alt="github icon"></a>
		</div>
	</div>
</div>

<style>
	.main-container {
		height: 10vh;
		border-bottom: solid rgb(117, 117, 117) 3px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: transparent;
		transition: all 0.3s ease;
	}
	.main-container.light {
		border-bottom: solid #ccc 3px;
	}
	.image {
		width: 74px;
		margin-left: 20px;
	}
	img{
		width:24px
	}
	.icons{
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-right: 20px;
	}
</style>