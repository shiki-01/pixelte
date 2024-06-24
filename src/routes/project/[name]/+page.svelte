<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let projectData = [];
	onMount(async () => {
		const parms = $page.params.name;
		projectData = await window.electron.project.getProject(parms);
	});
</script>
