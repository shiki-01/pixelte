<script lang="ts">
	import * as Menubar from '$lib/components/ui/menubar';
	import Menu from '$lib/Menu.svelte';

	interface MenuItem {
		label?: string;
		icon?: string;
		role?: string;
		accelerator?: string;
		type?: string;
		submenu?: MenuItem[];
	}

	export let menu: MenuItem[];

	function handleItemClick(item: MenuItem) {
		if (item.label) {
			console.log(`${item.label} clicked`);
		} else if (item.role) {
			console.log(`${item.role} action triggered`);
		}
	}
</script>

{#if menu}
	{#each menu as item, index (item.label ?? index)}
		{#if item.submenu}
			<Menubar.Menu>
				<Menubar.Trigger>{item.label}</Menubar.Trigger>
				<Menubar.Content>
					<Menu menu={item.submenu} />
				</Menubar.Content>
			</Menubar.Menu>
		{:else if item.role}
			<Menubar.Item>{item.role}</Menubar.Item>
		{:else if item.type === 'separator'}
			<Menubar.Separator />
		{:else}
			<Menubar.Item>{item.label}</Menubar.Item>
		{/if}
	{/each}
{/if}

<style>
</style>
