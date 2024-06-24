<script lang="ts">
	import '../app.css';
	import { Button } from '$lib/components/ui/button';
	import * as Menubar from '$lib/components/ui/menubar';
	import { X, Minus, Square } from 'lucide-svelte';
	import Menu from '$lib/Menu.svelte';
	import { onMount } from 'svelte';

	let menu: any;

	onMount(async () => {
		menu = await window.electron.system.getMenu();
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
</script>

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
