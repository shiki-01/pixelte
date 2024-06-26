const { app, BrowserWindow, ipcMain, Menu, protocol, ipcRenderer } = require('electron');
const windowStateManager = require('electron-window-state');
const fs = require('fs');
const path = require('path');
const { template, menu } = require('./menu.cjs');

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

let tabs = [];

ipcMain.on('stop-command', (event, channel) => {
    ipcMain.removeAllListeners(channel);
});

ipcMain.on('add-tab', (event, tabName) => {
    tabs.push(tabName);
    if (projectWindow) {
        projectWindow.webContents.send('update-tabs', tabs);
    }
});

ipcMain.on('remove-tab', (event, tabName) => {
    tabs = tabs.filter(tab => tab !== tabName);
    if (projectWindow) {
        projectWindow.webContents.send('update-tabs', tabs);
    }
});

ipcMain.handle('get-tabs', () => {
    return tabs;
});

let projectWindow;

ipcMain.handle('open-tab', async (event, tabName) => {
    if (projectWindow) {
        projectWindow.focus();
        return;
    }

    projectWindow = new BrowserWindow({
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
    });

    import('electron-context-menu').then(module => {
        const contextMenu = module.default;
        contextMenu({
            window: projectWindow,
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

    projectWindow.once('ready-to-show', () => {
        projectWindow.show();
        projectWindow.focus();
    });

    projectWindow.on('close', () => {
        tabs = [];
        projectWindow = null;
    });


    if (dev) {
        projectWindow.loadURL(`http://localhost:${port}/project/}`).catch((e) => {
            console.log('Error loading URL, retrying', e);
            setTimeout(() => {
                projectWindow.loadURL(`http://localhost:${port}/project/`);
            }, 200);
        });
    } else {
        projectWindow.loadURL(`app://./project/`);
        serve(projectWindow);
    }
});

// file
ipcMain.handle('get-projects', async () => {
    const projectData = path.join(app.getPath('userData'), 'pixelte');
    const projects = fs.readdirSync(projectData);
    let projectConfigs = [];
    for (let i = 0; i < projects.length; i++) {
        const configPath = path.join(projectData, projects[i], 'config.json');
        try {
            const configData = fs.readFileSync(configPath);
            if (configData.length > 0) {
                const projectConfig = JSON.parse(configData);
                projectConfigs.push({
                    projectName: projects[i],
                    ...projectConfig
                });
            } else {
                projectConfigs.push({
                    projectName: projects[i],
                    error: 'Invalid or empty config.json'
                });
            }
        } catch (error) {
            console.error(`Error reading or parsing config.json for project ${projects[i]}:`, error);
            projectConfigs.push({
                projectName: projects[i],
                error: 'Failed to read or parse config.json'
            });
        }
    }

    return { projectConfigs };
});

ipcMain.handle('create-project', async (event, projectName) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);
	if (!fs.existsSync(projectData)) {
		fs.mkdirSync(projectData, { recursive: true });
		fs.writeFileSync(path.join(projectData, 'config.json'), JSON.stringify({ name: projectName }));
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

	return { projectConfig };
});

ipcMain.handle('save-project', async (event, projectName, projectFile, changed) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);

	fs.writeFileSync(path.join(projectData, projectFile), changed);
});

ipcMain.handle('create-file', async (event, projectName, projectFile) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);

	fs.writeFileSync(path.join(projectData, projectFile), '');
});