const { app, BrowserWindow, ipcMain, Menu, protocol } = require('electron');
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

// system
ipcMain.handle('get-menu', () => {
    function buildMenuItems(menuItems) {
        // menuItemsが配列であることを確認
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

// file
ipcMain.handle('get-projects', async () => {
	const projectData = path.join(app.getPath('userData'), 'pixelte');
	const projects = fs.readdirSync(projectData);
	let projectConfig = {};
	for (let i = 0; i < projects.length; i++) {
		projectConfig = JSON.parse(fs.readFileSync(path.join(projectData, projects[i], 'config.json')));
	}

	return { projects, projectConfig };
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
	const projectFiles = fs.readdirSync(projectData);

	return { projectConfig, projectFiles };
});

ipcMain.handle('save-project', async (event, projectName, projectFile, changed) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);

	fs.writeFileSync(path.join(projectData, projectFile), changed);
});

ipcMain.handle('create-file', async (event, projectName, projectFile) => {
	const projectData = path.join(app.getPath('userData'), 'pixelte', projectName);

	fs.writeFileSync(path.join(projectData, projectFile), '');
});