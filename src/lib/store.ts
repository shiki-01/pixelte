import { writable } from 'svelte/store';
import type { Project } from './types';

type projectName = Project['projectName'];

export const projectTab = writable<projectName[]>([]);