<script lang="ts">
	import { onMount } from 'svelte';
	import type { Project } from '$lib/types';
	import { projectTab } from '$lib/store';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { EllipsisVertical, ExternalLink, FolderCog, Download, Trash2 } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let projectData: Project[] = [];

	$: projectData;

	function addNewTab(projectName: string) {
		projectTab.update((tabs) => {
			if (!tabs.includes(projectName)) {
				tabs.push(projectName);
				window.electron.system.addTabs(projectName);
			}
			return tabs;
		});
		if (window.location.pathname === '/') {
			window.location.href = `/project?tabs=${projectName}activeProject=${projectName}`;
		} else {
			const url = new URL(window.location.href);
			url.searchParams.set('tabs', projectName + ',' + url.searchParams.get('tabs'));
			url.searchParams.set('activeProject', projectName);
			window.location.href = url.href;
		}
	}

	onMount(async () => {
		const data = await window.electron.project.getProjects();
		projectData = data.projectConfigs;
	});
</script>

<main>
	<div class="flex flex-col gap-4 p-4">
		{#if projectData}
			{#each projectData as project}
				<Card.Root class="w-full">
					<Card.Header>
						<div class="flex justify-between">
							<Button
								variant="ghost"
								class="hover:bg-white"
								on:click={() => {
									addNewTab(project.projectName);
								}}
							>
								{project.projectName}
							</Button>
							<div class="flex justify-end">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<EllipsisVertical />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Label>Project Details</DropdownMenu.Label>
											<DropdownMenu.Separator />
											<DropdownMenu.Item>
												<div class="flex justify-between items-center">
													<ExternalLink size={20} />
													<span class="ml-2">Open</span>
												</div>
											</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Item>
												<div class="flex justify-between items-center">
													<FolderCog size={20} />
													<span class="ml-2">Edit</span>
												</div>
											</DropdownMenu.Item>
											<DropdownMenu.Item>
												<div class="flex justify-between items-center">
													<Download size={20} />
													<span class="ml-2">Export</span>
												</div>
											</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Item>
												<div
													class="flex justify-between items-center text-red-500"
												>
													<Trash2 size={20} />
													<span class="ml-2">Delete</span>
												</div>
											</DropdownMenu.Item>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
					</Card.Header>
				</Card.Root>
			{/each}
		{/if}
	</div>
</main>

<style>
</style>
