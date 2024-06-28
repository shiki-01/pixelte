<script lang="ts">
	import { page } from '$app/stores';
	import { projectTab, activeProject } from '$lib/store';
	import List from '$lib/List.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { onDestroy, onMount } from 'svelte';
	import { X, House } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let tabs: string[] = [];

	onMount(async () => {
		const params = $page.url.searchParams.get('tabs');
		if (params) {
			projectTab.set(params.split(','));
		}
		tabs = $projectTab;
	});

	onDestroy(() => {});

	function removeTabs(tab: string) {
		if (typeof window !== 'undefined') {
			window.electron.system.removeTabs(tab);
		}
		tabs = tabs.filter((t) => t !== tab);
		if (tabs.length === 0) {
			window.location.href = '/';
		}
	}
</script>

<main class="">
	{#if tabs.length > 0}
		<div class="flex flex-rows gap-4 px-4 border-y-2 align-middle">
			<div class="flex justify-end items-center align-middle">
				<Dialog.Root>
					<Dialog.Trigger>
						<Button variant="ghost" class="hover:bg-slate-50 h-5 p-0">
							<House size={15} />
						</Button>
					</Dialog.Trigger>
					<Dialog.Content class="max-w-[500px] max-h-[500px] overflow-y-auto">
						<div>
							<List />
						</div>
					</Dialog.Content>
				</Dialog.Root>
			</div>
			{#each tabs as tab}
				<div class="flex justify-between items-center">
					<Button variant="ghost" class="hover:bg-slate-50 h-5">{tab}</Button>
					<Button variant="ghost" class="w-5 h-5 p-0" on:click={() => removeTabs(tab)}>
						<X size={15} />
					</Button>
				</div>
			{/each}
		</div>
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
