import { writable } from 'svelte/store';
import type { Project } from './types';

type projectName = Project['projectName'];

export const projectTab = writable<projectName[]>([]);
export const activeProject = writable<projectName | null>(null);