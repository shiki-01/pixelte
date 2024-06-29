const { Menu } = require('electron');

const template = [
    {
        label: 'File',
        submenu: [
            {
                id: 'new-file',
                label: 'New',
                accelerator: 'CmdOrCtrl+N',
                click(item, focusedWindow){
                    console.log('new file');
                    if(focusedWindow) focusedWindow.webContents.send('new-file');
                },
            },
            {
                id: 'open-file',
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('open-file');
                },
            },
            {
                id: 'save-file',
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('save-file');
                },
            },
            {
                id: 'save-file-as',
                label: 'Save As',
                accelerator: 'CmdOrCtrl+Shift+S',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('save-file-as');
                },
            },
            {
                type: 'separator',
            },
            {
                id: 'close-file',
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('close-file');
                },
            },
            {
                type: 'separator',
            },
            {
                id: 'new-window',
                label: 'Settings',
                accelerator: 'CmdOrCtrl+,',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('settings');
                },
            },
            {
                type: 'separator',
            },
            {
                role: 'quit',
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                id: 'undo',
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('undo');
                },
            },
            {
                id: 'redo',
                label: 'Redo',
                accelerator: 'CmdOrCtrl+Shift+Z',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('redo');
                },
            },
            {
                type: 'separator',
            },
            {
                id: 'cut',
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('cut');
                },
            },
            {
                id: 'copy',
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('copy');
                },
            },
            {
                id: 'paste',
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('paste');
                },
            },
            {
                type: 'separator',
            },
            {
                id: 'select-all',
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('select-all');
                },
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                id: 'reload',
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('reload');
                },
            },
            {
                id: 'toggle-full-screen',
                label: 'Toggle Full Screen',
                accelerator: 'F11',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('toggle-full-screen');
                },
            },
            {
                id: 'toggle-dev-tools',
                label: 'Zen Mode',
                accelerator: 'F12',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('zen-mode');
                },
            },
            {
                label: 'Display',
                submenu: [
                    {
                        label: 'menu bar',
                        type: 'checkbox',
                    },
                    {
                        label: 'status bar',
                        type: 'checkbox',
                    },
                    {
                        label: 'sidebar',
                        type: 'checkbox',
                    },
                ]
            },
            {
                type: 'separator',
            },
            {
                id: 'zoom-in',
                label: 'Zoom In',
                accelerator: 'CmdOrCtrl+=',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('zoom-in');
                },
            },
            {
                id: 'zoom-out',
                label: 'Zoom Out',
                accelerator: 'CmdOrCtrl+-',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('zoom-out');
                },
            },
            {
                id: 'reset-zoom',
                label: 'Reset Zoom',
                accelerator: 'CmdOrCtrl+0',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('reset-zoom');
                },
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                id: 'about',
                label: 'About',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('about');
                },
            }
        ]
    }
];


if (process.platform === 'darwin') template.unshift({ role: 'appMenu' });

const menu = Menu.buildFromTemplate(template);

module.exports = { template, menu };