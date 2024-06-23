<script lang="ts">
	import '../app.css';
	import { Button } from '$lib/components/ui/button';
	import { X, Minus, Square } from 'lucide-svelte';

	function close() {
		window.electron.window.close();
	}
	function minimize() {
		window.electron.window.minimize();
	}
	function maximize() {
		window.electron.window.maximize();
	}
	function getProject() {
		window.electron.project.getProject();
	}
</script>

<div class="drag">
	<Button on:click={close}>
		<X />
	</Button>
	<Button on:click={minimize}>
		<Minus />
	</Button>
	<Button on:click={maximize}>
		<Square />
	</Button>
	<Button on:click={getProject}>Project</Button>
</div>

<slot />
