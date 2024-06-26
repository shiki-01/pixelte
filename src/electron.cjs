const { app, BrowserWindow, ipcMain, Menu, protocol, ipcRenderer } = require('electron');
const windowStateManager = require('electron-window-state');
const fs = require('fs');
const path = require('path');
const { template, menu } = require('./menu.cjs');
const zlib = require('zlib');
const { promisify } = require('util');
const { gzip, gunzip } = { gzip: promisify(zlib.gzip), gunzip: promisify(zlib.gunzip) };
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

let mainWindow;
let serve;
const dev = !app.isPackaged;
const port = process.env.PORT || 5173;

async function initializeApp() {
    try {
        const serveModule = await import('electron-serve');
        serve = serveModule.default({ directory: '.' });
    } catch (err) {
        console.error('Failed to load electron-serve', err);
    }

    if (process.env.NODE_ENV === 'development') {
        try {
            require('electron-reloader')(module, {});
        } catch (_) {}
    }

    createMainWindow();
}

function createWindow() {
    let windowState = windowStateManager({
        defaultWidth: 800,
        defaultHeight: 600,
    });

    mainWindow = new BrowserWindow({
        backgroundColor: 'whitesmoke',
        titleBarStyle: 'hidden',
        autoHideMenuBar: true,
        minHeight: 450,
        minWidth: 500,
        webPreferences: {
            enableRemoteModule: true,
            contextIsolation: true,
            nodeIntegration: true,
            spellcheck: false,
            devTools: dev,
            preload: path.join(__dirname, 'preload.cjs'),
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

    import('electron-context-menu').then(module => {
        const contextMenu = module.default;
        contextMenu({
            window: mainWindow,
            showLookUpSelection: false,
            showSearchWithGoogle: false,
            showCopyImage: false,
            prepend: (defaultActions, params, browserWindow) => [
                {
                    label: 'Make App 💻',
                },
            ],
        });
    }).catch(err => console.error('Failed to load electron-context-menu', err));

    if (dev) {
        mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
            console.log('Error loading URL, retrying', e);
            setTimeout(() => {
                mainWindow.loadURL(`http://localhost:${port}`);
            }, 200);
        });
    } else {
        serve(mainWindow);
    }

    return mainWindow;
}

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
}

protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true } }
]);

app.once('ready', () => {
	initializeApp();
	Menu.setApplicationMenu(menu);

	const projectData = path.join(app.getPath('userData'), 'pixelte');

    const settings = path.join(projectData, '.settings');

    const openTabs = path.join(settings, 'openTabs.json');

	if (!fs.existsSync(projectData)) {
		fs.mkdirSync(projectData, { recursive: true });
	}

    if (!fs.existsSync(settings)) {
        fs.mkdirSync(settings, { recursive: true });
    }

    if (!fs.existsSync(openTabs)) {
        fs.writeFileSync(openTabs, '[]');
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
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.close();
    }
});
ipcMain.on('window-minimize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.minimize();
    }
});
ipcMain.on('window-maximize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    }
});

// system
ipcMain.handle('get-menu', () => {
    function buildMenuItems(menuItems) {
        if (!Array.isArray(menuItems)) {
            console.error('menuItems is not an array:', menuItems);
            return [];
        }

        return menuItems.map(item => {
            const menuItem = {
                label: item.label,
            };
            if (item.submenu) {
                menuItem.submenu = buildMenuItems(item.submenu);
            }
            if (item.id) {
                menuItem.id = item.id;
            }
            if (item.role) {
                menuItem.role = item.role;
            }
            if (item.type) {
                menuItem.type = item.type;
            }
            if (item.accelerator) {
                menuItem.accelerator = item.accelerator;
            }
            return menuItem;
        });
    }
    return buildMenuItems(template);
});

ipcMain.handle('send-command', (event, command) => {
    mainWindow.webContents.send(command);
});

const openTabs = path.join(app.getPath('userData'), 'pixelte', '.settings', 'openTabs.json');

ipcMain.on('add-tab', (event, tabName) => {
    if (!tabName) {
        return;
    }
    let existingTabs = JSON.parse(fs.readFileSync(openTabs, 'utf8'));
    if (!existingTabs.some(tab => tab.name === tabName)) {
        existingTabs.push({name: tabName, isSaved: true});
        fs.writeFileSync(openTabs, JSON.stringify(existingTabs));
    }
});

ipcMain.on('remove-tab', (event, tabName) => {
    if (!tabName) {
        return;
    }
    let existingTabs = JSON.parse(fs.readFileSync(openTabs, 'utf8'));
    existingTabs = existingTabs.filter(tab => tab.name !== tabName);
    fs.writeFileSync(openTabs, JSON.stringify(existingTabs));
});

ipcMain.handle('get-tabs', () => {
    return JSON.parse(fs.readFileSync(openTabs, 'utf8'));
});

// file
ipcMain.handle('get-projects', async () => {
    const projectData = path.join(app.getPath('userData'), 'pixelte');
    const entries = fs.readdirSync(projectData);
    let projectConfigs = [];
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].endsWith('.settings')) {
            continue;
        }

        const entryPath = path.join(projectData, entries[i]);
        const isDirectory = fs.statSync(entryPath).isDirectory();
        if (isDirectory) {
            const configPath = path.join(entryPath, 'config.json.gz');
            if (fs.existsSync(configPath)) {
                try {
                    const configData = fs.readFileSync(configPath);
                    const decompressedData = zlib.gunzipSync(configData);
                    const projectConfig = JSON.parse(decompressedData);
                    projectConfigs.push({
                        projectName: entries[i],
                        ...projectConfig
                    });
                } catch (error) {
                    console.error(`Error reading or parsing config.json for project ${entries[i]}:`, error);
                    projectConfigs.push({
                        projectName: entries[i],
                        error: 'Failed to read or parse config.json'
                    });
                }
            } else {
                projectConfigs.push({
                    projectName: entries[i],
                    error: 'config.json.gz file does not exist'
                });
            }
        }
    }

    return { projectConfigs };
});

ipcMain.handle('create-project', async (event, projectName, width, height) => {
    const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);
    if (!fs.existsSync(projectData)) {
        fs.mkdirSync(projectData, { recursive: true });
        const configData = JSON.stringify({ name: projectName, width, height });
        const compressedConfigData = await gzipAsync(configData);
        fs.writeFileSync(path.join(projectData, 'config.json.gz'), compressedConfigData);

        const canvasData = Array.from({ length: height }, () => Array.from({ length: width }, () => "#00000000"));
        const compressedCanvasData = await gzipAsync(JSON.stringify(canvasData));
        fs.writeFileSync(path.join(projectData, 'canvas.json.gz'), compressedCanvasData);
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
    const compressedConfig = fs.readFileSync(path.join(projectData, 'config.json.gz'));
    const decompressedConfig = await gunzipAsync(compressedConfig);
    const projectConfig = JSON.parse(decompressedConfig.toString());

    const compressedCanvas = fs.readFileSync(path.join(projectData, 'canvas.json.gz'));
    const decompressedCanvas = await gunzipAsync(compressedCanvas);
    const canvasData = JSON.parse(decompressedCanvas.toString());

    return { projectConfig, canvasData };
});

ipcMain.handle('save-project', async (event, projectName, changed) => {
    const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);
    console.log('saving project', projectName, changed);

    if (changed.configChanges) {
        const compressedConfigData = await gzipAsync(JSON.stringify(changed.configChanges));
        fs.writeFileSync(path.join(projectData, 'config.json.gz'), compressedConfigData);
    }

    if (changed.canvasChanges) {
        const compressedCanvasData = await gzipAsync(JSON.stringify(changed.canvasChanges));
        fs.writeFileSync(path.join(projectData, 'canvas.json.gz'), compressedCanvasData);
        console.log('canvas saved');
    }
});

ipcMain.handle('create-file', async (event, projectName, projectFile) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);

	fs.writeFileSync(path.join(projectData, projectFile), '');
});