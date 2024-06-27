<script lang="ts">
	import { page } from '$app/stores';
	import { projectTab, activeProject } from '$lib/store';
	import { onDestroy, onMount } from 'svelte';

	onMount(async () => {
		const parm = $page.params.name;
		activeProject.set(parm);
		unsubscribe();
	});

	let tabs: string[] = [];

	async function unsubscribe() {
		if (typeof window !== 'undefined') {
			const data = await window.electron.system.getTabs();
			tabs = data.map((tab: { name: any }) => tab.name);
		}
	}

	onDestroy(() => {
		unsubscribe();
	});

	function removeTabs(tab: string) {
		if (typeof window !== 'undefined') {
			window.electron.system.removeTabs(tab);
		}
		tabs = tabs.filter((t) => t !== tab);
	}

	$: {
		if (tabs.length >= 0 && typeof window !== 'undefined') {
			window.location.href = `/`;
		}
	}
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
		<a href="/">Go back</a>
	{/if}
</main>

<style>
	main {
		display: grid;
		grid-template-rows: 2em 1fr;
	}
</style>
