import { contextBridge, ipcRenderer } from 'electron';
import { create } from 'electron-connect/lib/server';

contextBridge.exposeInMainWorld('electron', {
	send: (channel, data) => {
		ipcRenderer.send(channel, data);
	},
	sendSync: (channel, data) => {
		ipcRenderer.sendSync(channel, data);
	},
	receive: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	},
	window: {
		close: () => ipcRenderer.send('window-close'),
		minimize: () => ipcRenderer.send('window-minimize'),
		maximize: () => ipcRenderer.send('window-maximize'),
	},
	project: {
		getProjects: async () => {
			return await ipcRenderer.invoke('get-projects');
		},
		createProject: async (projectName) => {
			return await ipcRenderer.invoke('create-project', projectName);
		},
		deleteProject: async (projectName) => {
			return await ipcRenderer.invoke('delete-project', projectName);
		},
		getProject: async (projectName) => {
			return await ipcRenderer.invoke('get-project', projectName);
		},
		saveProject: async (projectName, projectFile, changed) => {
			return await ipcRenderer.invoke('save-project', projectName, projectFile, changed);
		},
		createFile: async (projectName, fileName) => {
			return await ipcRenderer.invoke('create-file', projectName, fileName);
		},
	}
});
