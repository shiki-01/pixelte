<script lang="ts">
	import { Download, FolderCog, Trash2 } from 'lucide-svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { onMount } from 'svelte';

	export let projectName: string;
	let canvasData: any;
	let selectedColor = '#ff0000';

	onMount(async () => {
		const data = await window.electron.project.getProject(projectName);
		canvasData = data.canvasData;
		console.log(canvasData);
		console.log(data);
	});

	function updatePixel(rowIndex: string | number, pixelIndex: string | number) {
		const numericRowIndex = Number(rowIndex);
		const numericPixelIndex = Number(pixelIndex);
		const currentCanvasData = [...canvasData];
		currentCanvasData[numericRowIndex][numericPixelIndex] = selectedColor;
		canvasData = currentCanvasData;
	}

	async function saveCanvas() {
		const currentCanvasData = canvasData;
		await window.electron.project.saveProject(projectName, {
			canvasChanges: currentCanvasData,
		});
		console.log('saved');
	}
</script>

<main class="">
	<div class="flex flex-col gap-4 p-4">
		<div class="flex justify-between">
			<h1 class="text-2xl font-bold">Project: {projectName}</h1>
			<div class="flex justify-end">
				<button class="hover:bg-white" on:click={saveCanvas}>
					<Download size={20} />
				</button>
				<button class="hover:bg-white">
					<Trash2 size={20} />
				</button>
				<button class="hover:bg-white">
					<FolderCog size={20} on:click={() => window.location.reload} />
				</button>
			</div>
		</div>
		<a href="/">home</a>
		<div class="flex">
			<Resizable.PaneGroup direction="horizontal" class="rounded-lg border">
				<Resizable.Pane defaultSize={20}>
					<div class="flex h-[200px] items-center justify-center p-6">one</div>
				</Resizable.Pane>
				<Resizable.Handle />
				<Resizable.Pane defaultSize={50} class="overflow-auto">
					<div class="flex h-[200px] items-center justify-center p-6 border-2">
						{#if canvasData}
							{#each canvasData as row, rowIndex}
								<div class="flex flex-col">
									{#each row as pixel, pixelIndex}
										<div
											class="cursor-pointer w-5 h-5"
											style="background-color: {pixel}"
											on:click={() => updatePixel(rowIndex, pixelIndex)}
										></div>
									{/each}
								</div>
							{/each}
						{/if}
					</div>
				</Resizable.Pane>
				<Resizable.Handle />
				<Resizable.Pane defaultSize={50}>
					<Resizable.PaneGroup direction="vertical">
						<Resizable.Pane defaultSize={25}>
							<div class="flex h-full items-center justify-center p-6">
								<span class="font-semibold">Two</span>
							</div>
						</Resizable.Pane>
						<Resizable.Handle />
						<Resizable.Pane defaultSize={75}>
							<div class="flex h-full items-center justify-center p-6">
								<span class="font-semibold">Three</span>
							</div>
						</Resizable.Pane>
					</Resizable.PaneGroup>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</div>
	</div>
</main>

<style>
</style>
