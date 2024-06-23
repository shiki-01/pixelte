import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import windowStateManager from 'electron-window-state';
import contextMenu from 'electron-context-menu';
import serve from 'electron-serve';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);


if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module, {});
  } catch (_) {}
}

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;
let mainWindow;

function createWindow() {
	let windowState = windowStateManager({
		defaultWidth: 800,
		defaultHeight: 600,
	});

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 17,
			y: 32,
		},
		minHeight: 450,
		minWidth: 500,
		webPreferences: {
			enableRemoteModule: true,
			contextIsolation: true,
			nodeIntegration: true,
			spellcheck: false,
			devTools: dev,
			preload: path.join(__dirname, 'preload.js'),
		},
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
	});

	windowState.manage(mainWindow);

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	mainWindow.on('close', () => {
		windowState.saveState(mainWindow);
	});

	return mainWindow;
}

contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Make App 💻',
		},
	],
});

function loadVite(port) {
	mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
		console.log('Error loading URL, retrying', e);
		setTimeout(() => {
			loadVite(port);
		}, 200);
	});
}

function createMainWindow() {
	mainWindow = createWindow();
	mainWindow.once('close', () => {
		mainWindow = null;
	});

	if (dev) loadVite(port);
	else serveURL(mainWindow);
}

app.once('ready', () => {
	createMainWindow();

	const projectData = path.join(app.getPath('userData'), 'pixelte');

	if (!fs.existsSync(projectData)) {
		fs.mkdirSync(projectData, { recursive: true });
	}
});
app.on('activate', () => {
	if (!mainWindow) {
		createMainWindow();
	}
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('to-main', (event, count) => {
	return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
});


// window
ipcMain.on('window-close', () => {
	mainWindow.close();
});
ipcMain.on('window-minimize', () => {
	mainWindow.minimize();
});
ipcMain.on('window-maximize', () => {
	if (mainWindow.isMaximized()) {
		mainWindow.unmaximize();
	} else {
		mainWindow.maximize();
	}
});

// file
ipcMain.handle('get-projects', async () => {
	const projectData = path.join(app.getPath('userData'), 'pixelte');
	const projects = fs.readdirSync(projectData);
	let projectConfig = {};
	for (let i = 0; i < projects.length; i++) {
		projectConfig = JSON.parse(fs.readFileSync(path.join(projectData, projects[i], 'config.json')));
	}

	return {projects, projectConfig};
});

ipcMain.handle('create-project', async (event, projectName) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);
	if (!fs.existsSync(projectData)) {
		fs.mkdirSync(projectData, { recursive: true });
		fs.writeFileSync(path.join(projectData, 'config.json'), JSON.stringify({name: projectName}));
	}

	return projectName;
});

ipcMain.handle('delete-project', async (event, projectName) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);
	if (fs.existsSync(projectData)) {
		fs.rmdirSync(projectData, { recursive: true });
	}

	return projectName;
});

ipcMain.handle('get-project', async (event, projectName) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);
	const projectConfig = JSON.parse(fs.readFileSync(path.join(projectData, 'config.json')));
	const projectFiles = fs.readdirSync(projectData);

	return {projectConfig, projectFiles};
});

ipcMain.handle('save-project', async (event, projectName,  projectFile, changed) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);

	fs.writeFileSync(path.join(projectData, projectFile), changed);
});

ipcMain.handle('create-file', async (event, projectName, projectFile) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);

	fs.writeFileSync(path.join(projectData, projectFile), '');
});