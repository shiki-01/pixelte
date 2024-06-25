<script lang="ts">
	import { page } from '$app/stores';
	import type { Project } from '$lib/types';
	import { onMount } from 'svelte';

	let projectData: Project;
	onMount(async () => {});

	$: projectData;
</script>

<main class="">
	{#if projectData}
		<div>
			<h1>Project: {projectData.projectName}</h1>
		</div>
	{/if}
</main>

<style>
	main {
		display: grid;
		grid-template-rows: 2em 1fr;
	}
</style>
