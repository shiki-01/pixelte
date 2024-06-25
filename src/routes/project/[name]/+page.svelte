<script lang="ts">
	import { page } from '$app/stores';
	import type { Project } from '$lib/types';
	import { onMount } from 'svelte';

	let projectData: Project;
	onMount(async () => {
		const parms = $page.params.name;
		const data = await window.electron.project.getProject(parms);
		projectData = data.projectConfig;
		console.log(projectData);
	});

	$: projectData;
</script>

<main>
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
