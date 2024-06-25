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

	async function removeTabs(tab: string) {
		if (typeof window !== 'undefined') {
			await window.electron.system.removeTabs(tab);
			tabs = await getTabs();
		}
	}

	onMount(async () => {
		tabs = await getTabs();
	});

	onDestroy(() => {
		tabs = [];
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
