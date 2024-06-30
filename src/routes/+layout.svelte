<script lang="ts">
	import '../app.css';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Menubar from '$lib/components/ui/menubar';
	import { X, Minus, Square } from 'lucide-svelte';
	import Menu from '$lib/Menu.svelte';
	import { onMount } from 'svelte';

	let menu: any;

	let showModal = false;
	let newProject = '';
	let newProjectWidth = 0;
	let newProjectHeight = 0;

	onMount(async () => {
		menu = await window.electron.system.getMenu();
		window.electron.receive.receiveNewFile(() => {
			showModal = true;
		});
	});

	function close() {
		window.electron.window.close();
	}
	function minimize() {
		window.electron.window.minimize();
	}
	function maximize() {
		window.electron.window.maximize();
	}

	function createFile() {
		window.electron.project.createProject(newProject, newProjectWidth, newProjectHeight);
		showModal = false;
		window.location.reload();
	}
</script>

<Dialog.Root open={showModal} on:close={() => (showModal = false)}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create profile</Dialog.Title>
			<Dialog.Description>Enter your name to create a new profile.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input id="name" bind:value={newProject} class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<div class="col-span-4">
					<Label for="width" class="text-right">Width</Label>
					<Input id="width" bind:value={newProjectWidth} class="w-full" />
				</div>
				<div class="col-span-4">
					<Label for="height" class="text-right">Height</Label>
					<Input id="height" bind:value={newProjectHeight} class="w-full" />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" on:click={() => createFile()}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<div class="drag flex justify-between items-center">
	<div class="no-drag">
		<Menubar.Root class="w-fit border-none">
			<Menu {menu} />
		</Menubar.Root>
	</div>
	<div class="no-drag">
		<Button variant="ghost" size="icon" on:click={minimize}>
			<Minus />
		</Button>
		<Button variant="ghost" size="icon" on:click={maximize}>
			<Square />
		</Button>
		<Button variant="ghost" size="icon" on:click={close}>
			<X />
		</Button>
	</div>
</div>

<slot />

<style>
	.drag {
		-webkit-app-region: drag;
	}
	.no-drag {
		-webkit-app-region: no-drag;
	}
</style>
