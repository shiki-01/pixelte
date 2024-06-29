<script lang="ts">
	import { Download, FolderCog, Trash2 } from 'lucide-svelte';
	import { onMount } from 'svelte';

	export let projectName: string;

	onMount(async () => {
		const data = await window.electron.project.getProject(projectName);
		console.log(data);
	});
</script>

<main>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex justify-between">
			<h1 class="text-2xl font-bold">Project: {projectName}</h1>
			<div class="flex justify-end">
				<button class="hover:bg-white">
					<FolderCog size={20} />
				</button>
				<button class="hover:bg-white">
					<Download size={20} />
				</button>
				<button class="hover:bg-white">
					<Trash2 size={20} />
				</button>
			</div>
		</div>
	</div>
</main>
