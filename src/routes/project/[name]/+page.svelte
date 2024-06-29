<script lang="ts">
	import { page } from '$app/stores';
	import { projectTab, activeProject } from '$lib/store';
	import List from '$lib/List.svelte';
	import Editor from '$lib/Editor.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { onDestroy, onMount } from 'svelte';
	import { X, House } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	onMount(async () => {
		const parm = $page.params.name;
		activeProject.set(parm);
		projectTab.update((tabs) => {
			if (!tabs.includes(parm)) {
				tabs.push(parm);
				window.electron.system.addTabs(parm);
			}
			return tabs;
		});
	});
</script>

<main class="">
	{#if $activeProject}
		<div class="flex flex-rows gap-4 px-4 border-y-2 align-middle">
			<div class="flex justify-end items-center align-middle">
				<House size={20} on:click={() => (window.location.href = '/')} />
			</div>
			<div class="flex justify-between items-center">
				<Button variant="ghost" class="hover:bg-slate-50 h-5">{$activeProject}</Button>
				<Button variant="ghost" class="w-5 h-5 p-0" on:click={() => console.log()}>
					<X size={15} />
				</Button>
			</div>
		</div>
		<Editor projectName={$activeProject} />
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
