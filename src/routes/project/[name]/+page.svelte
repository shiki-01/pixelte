<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let tabs: string[] = [];

	async function getTabs() {
		if (typeof window !== 'undefined') {
			const result = await window.electron.system.getTabs();
			return result;
		}
		return [];
	}

	function setupTabUpdateListener() {
		console.log('setup');
		const listener = async (event, args) => {
			if (args.command === 'reload') {
				tabs = await getTabs();
			}
		};
		window.electron.receive.ipcRenderer.on('execute-command', listener);
		return () => window.electron.receive.ipcRenderer.off('execute-command', listener);
	}

	async function removeTabs(tab: string) {
		if (typeof window !== 'undefined') {
			await window.electron.system.removeTabs(tab);
			tabs = await getTabs();
		}
	}

	let removeListener;

	onMount(async () => {
		tabs = await getTabs();
		console.log('mount');
		if (typeof window !== 'undefined') {
			setupTabUpdateListener();
			tabs = await getTabs();
		}
	});

	onDestroy(() => {
		console.log('destroy');
		if (typeof window !== 'undefined' && removeListener) {
			window.electron.receive.ipcRenderer.off('execute-command', listener);
		}
	});
</script>

<main class="">
	{#if tabs.length > 0}
		{#each tabs as tab}
			<div>
				{tab}
				<button on:click={() => removeTabs(tab)}>Close</button>
			</div>
		{/each}
	{:else}
		<div>No tabs</div>
	{/if}
</main>

<style>
	main {
		display: grid;
		grid-template-rows: 2em 1fr;
	}
</style>
