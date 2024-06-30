const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	send: (channel, data) => {
		ipcRenderer.send(channel, data);
	},
	sendSync: (channel, data) => {
		ipcRenderer.sendSync(channel, data);
	},
	receive: {
		receiveNewFile: (callback) => {
			ipcRenderer.on('new-file', (event, ...args) => callback(...args));
		}
	},
	off: (channel, func) => {
		ipcRenderer.off(channel, func);
	},
	window: {
		close: () => ipcRenderer.send('window-close'),
		minimize: () => ipcRenderer.send('window-minimize'),
		maximize: () => ipcRenderer.send('window-maximize'),
		openTab: (tabName) => ipcRenderer.invoke('open-tab', tabName),
	},
	system: {
		command: (callback) => {
			ipcRenderer.on('update-tabs', ( _event, command) => {
				callback(command)
			});
		},
		sendCommand: (command) => {
			ipcRenderer.invoke('send-command', command);
		},
		stopCommand: (channel) => {
            ipcRenderer.send('stop-command', channel);
        },
		getMenu: async () => {
			return await ipcRenderer.invoke('get-menu');
		},
		addTabs: (tabName) => ipcRenderer.send('add-tab', tabName),
		removeTabs: (tabName) => ipcRenderer.send('remove-tab', tabName),
		getTabs: async () => {
			return await ipcRenderer.invoke('get-tabs');
		}
	},
	project: {
		getProjects: async () => {
			return await ipcRenderer.invoke('get-projects');
		},
		createProject: async (projectName, width, height) => {
			return await ipcRenderer.invoke('create-project', projectName, width, height);
		},
		deleteProject: async (projectName) => {
			return await ipcRenderer.invoke('delete-project', projectName);
		},
		getProject: async (projectName) => {
			return await ipcRenderer.invoke('get-project', projectName);
		},
		saveProject: async (projectName, changed) => {
			return await ipcRenderer.invoke('save-project', projectName, changed);
		},
		createFile: async (projectName, fileName) => {
			return await ipcRenderer.invoke('create-file', projectName, fileName);
		},
	}
});
