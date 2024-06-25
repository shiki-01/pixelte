const { Menu } = require('electron');

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New',
                accelerator: 'CmdOrCtrl+N',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('new-file');
                },
            },
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('open-file');
                },
            },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('save-file');
                },
            },
            {
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
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('undo');
                },
            },
            {
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
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('cut');
                },
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('copy');
                },
            },
            {
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
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('reload');
                },
            },
            {
                label: 'Toggle Full Screen',
                accelerator: 'F11',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('toggle-full-screen');
                },
            },
            {
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
                label: 'Zoom In',
                accelerator: 'CmdOrCtrl+=',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('zoom-in');
                },
            },
            {
                label: 'Zoom Out',
                accelerator: 'CmdOrCtrl+-',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.webContents.send('zoom-out');
                },
            },
            {
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