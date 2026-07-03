const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let nextServer = null;

// === بدء خادم Next.js ===
function startNextServer() {
  return new Promise((resolve, reject) => {
    const isDev = !app.isPackaged;
    const port = 3000;

    if (isDev) {
      // وضع التطوير
      nextServer = spawn('npx', ['next', 'dev', '-p', String(port)], {
        cwd: path.join(__dirname, '..'),
        shell: true,
        stdio: 'pipe',
      });
    } else {
      // وضع الإنتاج - استخدم الخادم المدمج
      nextServer = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, '..', '.next', 'standalone'),
        shell: true,
        stdio: 'pipe',
        env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
      });
    }

    let resolved = false;

    nextServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Next.js]', output);
      if (!resolved && (output.includes('Ready') || output.includes('ready'))) {
        resolved = true;
        resolve(port);
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error('[Next.js Error]', data.toString());
    });

    nextServer.on('error', (err) => {
      console.error('Failed to start server:', err);
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    // Fallback: انتظر ثم حاول الاتصال
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(port);
      }
    }, 15000);
  });
}

// === إنشاء النافذة ===
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'برنامج إعداد دراسات الجدوى',
    icon: path.join(__dirname, '..', 'public', 'icons', 'icon-512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  // القائمة
  const menuTemplate = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'مشروع جديد',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-action', 'new-project'),
        },
        {
          label: 'فتح مشروع',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu-action', 'open-project'),
        },
        { type: 'separator' },
        {
          label: 'حفظ',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-action', 'save'),
        },
        {
          label: 'تصدير',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow.webContents.send('menu-action', 'export'),
        },
        { type: 'separator' },
        { role: 'quit', label: 'خروج' },
      ],
    },
    {
      label: 'عرض',
      submenu: [
        { role: 'reload', label: 'إعادة تحميل' },
        { role: 'toggleDevTools', label: 'أدوات المطور' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'حجم طبيعي' },
        { role: 'zoomIn', label: 'تكبير' },
        { role: 'zoomOut', label: 'تصغير' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'ملء الشاشة' },
      ],
    },
    {
      label: 'مساعدة',
      submenu: [
        {
          label: 'دليل الاستخدام',
          accelerator: 'F1',
          click: () => mainWindow.webContents.send('menu-action', 'guide'),
        },
        {
          label: 'حول البرنامج',
          click: () => mainWindow.webContents.send('menu-action', 'about'),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // تحميل الصفحة
  mainWindow.loadURL(`http://localhost:3000`);

  // إظهار النافذة عند الجاهزية
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // فتح الروابط الخارجية في المتصفح
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// === دورة حياة التطبيق ===
app.whenReady().then(async () => {
  try {
    console.log('Starting Next.js server...');
    await startNextServer();
    console.log('Server ready, creating window...');
    createWindow();
  } catch (err) {
    console.error('Failed to start:', err);
    // محاولة إنشاء النافذة على أي حال
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }
  app.quit();
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
