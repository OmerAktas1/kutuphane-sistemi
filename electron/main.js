const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let backendProcess = null;
let mainWindow = null;
let retries = 0;
const MAX_RETRIES = 50;
let isQuitting = false;
let lastBackendError = '';
let backendLogs = [];
let backendReady = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Kutuphane Takip Sistemi',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getAppDataPath() {
  return process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local');
}

function getAppLogPath() {
  return path.join(getAppDataPath(), 'KutuphaneTakip', 'logs');
}

function writeAppLog(message, type) {
  type = type || 'INFO';
  var logPath = getAppLogPath();
  try {
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
    }
    var timestamp = new Date().toISOString();
    var logLine = '[' + timestamp + '] [' + type + '] ' + message + '\n';
    fs.appendFileSync(path.join(logPath, 'app.log'), logLine);
  } catch (e) {
    // Silently fail
  }
  console.log('[App ' + type + '] ' + message);
}

function readBackendLogs() {
  try {
    var logPath = getAppLogPath();
    var errorLogPath = path.join(logPath, 'error.log');
    var combinedLogPath = path.join(logPath, 'combined.log');
    var logs = [];
    if (fs.existsSync(errorLogPath)) {
      var content = fs.readFileSync(errorLogPath, 'utf-8');
      var lines = content.split('\n').filter(function(l) { return l.trim(); });
      logs = logs.concat(lines.slice(-30));
    }
    if (fs.existsSync(combinedLogPath)) {
      var content = fs.readFileSync(combinedLogPath, 'utf-8');
      var lines = content.split('\n').filter(function(l) { return l.trim(); });
      logs = logs.concat(lines.slice(-30));
    }
    return logs.slice(-15);
  } catch (err) {
    return [];
  }
}

function showDetailedError(errorType, message, details) {
  details = details || '';
  writeAppLog('ERROR: ' + errorType + ' - ' + message, 'ERROR');

  var fullMessage = errorType + '\n\n' + message;
  if (details) {
    fullMessage += '\n\n' + details;
  }
  var backendLogs = readBackendLogs();
  if (backendLogs.length > 0) {
    fullMessage += '\n\n--- Son Loglar ---\n' + backendLogs.slice(-8).join('\n');
  }
  fullMessage += '\n\nLog: %LOCALAPPDATA%\\KutuphaneTakip\\logs\\app.log';

  dialog.showErrorBox('Hata', fullMessage);
}

function checkBackend(callback) {
  var options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/health',
    method: 'GET',
    timeout: 3000,
  };

  var req = http.request(options, function(res) {
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      writeAppLog('Health check response: ' + res.statusCode + ' - ' + body.substring(0, 100));
      callback(res.statusCode === 200, res.statusCode);
    });
  });

  req.on('error', function(err) {
    writeAppLog('Health check error: ' + err.message, 'WARN');
    callback(false, 0);
  });

  req.on('timeout', function() {
    writeAppLog('Health check timeout', 'WARN');
    req.destroy();
    callback(false, 0);
  });

  req.end();
}

function startBackend() {
  writeAppLog('Backend baslatiliyor...');

  var appFolderPath = path.join(getAppDataPath(), 'KutuphaneTakip');

  var backendPath;
  if (app.isPackaged) {
    backendPath = path.join(app.getAppPath(), 'backend');
  } else {
    backendPath = path.join(process.cwd(), 'backend');
  }

  writeAppLog('Backend yolu: ' + backendPath);
  writeAppLog('Paketli mi: ' + app.isPackaged);
  writeAppLog('CWD: ' + process.cwd());

  var indexPath = path.join(backendPath, 'dist', 'index.js');
  var distExists = fs.existsSync(indexPath);
  writeAppLog('dist/index.js mevcut: ' + distExists);
  writeAppLog('dist/index.js yolu: ' + indexPath);

  if (!distExists) {
    writeAppLog('KRITIK: dist/index.js bulunamadi!', 'ERROR');
    showDetailedError(
      'Backend Dosya Bulunamadi',
      'dist/index.js dosyasi mevcut degil.',
      'Yol: ' + indexPath + '\nLutfen npm run build calistirin.'
    );
    return;
  }

  // Check node_modules for critical packages
  var prismaPath = path.join(backendPath, 'node_modules', '.prisma');
  writeAppLog('Prisma client mevcut: ' + fs.existsSync(prismaPath));

  // Ensure data directory for SQLite (relative to backend cwd)
  var dataDir = path.join(backendPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    writeAppLog('Data klasoru olusturuldu: ' + dataDir);
  }

  // Ensure app data directory for logs
  if (!fs.existsSync(appFolderPath)) {
    fs.mkdirSync(appFolderPath, { recursive: true });
    writeAppLog('App data klasoru olusturuldu: ' + appFolderPath);
  }

  var logsDir = path.join(appFolderPath, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Database: use relative path that Prisma understands
  // Prisma resolves relative paths from CWD of the process
  var dbPath = path.join(dataDir, 'kutuphane.db');
  writeAppLog('Veritabani yolu: ' + dbPath);
  writeAppLog('Veritabani mevcut: ' + fs.existsSync(dbPath));

  // Copy default DB if needed
  var defaultDbPath = path.join(backendPath, 'data', 'kutuphane.db');
  if (!fs.existsSync(dbPath) && fs.existsSync(defaultDbPath)) {
    fs.copyFileSync(defaultDbPath, dbPath);
    writeAppLog('Veritabani defaulttan kopyalandi');
  }

  // IMPORTANT: Use relative path for Prisma SQLite
  // Prisma resolves file:./ relative paths from CWD of the Node process
  var databaseUrl = 'file:./data/kutuphane.db';
  writeAppLog('DATABASE_URL: ' + databaseUrl);

  var env = Object.assign({}, process.env, {
    NODE_ENV: 'production',
    PORT: '3001',
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: 'debug'
  });

  writeAppLog('Node prosesi baslatiliyor...');
  writeAppLog('CWD: ' + backendPath);
  writeAppLog('Komut: node dist/index.js');
  writeAppLog('PORT: 3001');

  try {
    backendProcess = spawn('node', ['dist/index.js'], {
      cwd: backendPath,
      env: env,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (err) {
    writeAppLog('Proces baslatma hatasi: ' + err.message, 'ERROR');
    lastBackendError = err.message;
    showDetailedError('Backend Baslatma Hatasi', 'Node prosesi baslatilamadi.', err.message);
    return;
  }

  writeAppLog('Backend prosesi PID: ' + backendProcess.pid);

  backendProcess.stdout.on('data', function(data) {
    var output = data.toString();
    var lines = output.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line) {
        backendLogs.push(line);
        if (backendLogs.length > 200) backendLogs.shift();
        writeAppLog('[Backend] ' + line);
      }
    }
  });

  backendProcess.stderr.on('data', function(data) {
    var output = data.toString();
    var lines = output.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line) {
        backendLogs.push('[ERR] ' + line);
        if (backendLogs.length > 200) backendLogs.shift();
        writeAppLog('[Backend Error] ' + line, 'ERROR');
        lastBackendError = line;
      }
    }
  });

  backendProcess.on('close', function(code) {
    writeAppLog('Backend kapandi, cikis kodu: ' + code, code === 0 ? 'INFO' : 'ERROR');
    backendReady = false;
    if (!isQuitting && code !== 0) {
      lastBackendError = 'Backend cikis kodu: ' + code;
      writeAppLog('Backend 3 saniye sonra yeniden baslatilacak...', 'WARN');
      setTimeout(function() {
        retries = 0;
        startBackend();
        waitForBackend();
      }, 3000);
    }
  });

  backendProcess.on('error', function(err) {
    writeAppLog('Backend proses hatasi: ' + err.message, 'ERROR');
    lastBackendError = err.message;
  });
}

function waitForBackend() {
  writeAppLog('Backend bekleniyor... (deneme ' + (retries + 1) + '/' + MAX_RETRIES + ')');

  checkBackend(function(ready, statusCode) {
    if (ready) {
      writeAppLog('Backend hazir! Health check basarili.');
      retries = 0;
      backendReady = true;
      lastBackendError = '';
      if (mainWindow) {
        writeAppLog('Sayfa yukleniyor: http://localhost:3001');
        mainWindow.loadURL('http://localhost:3001').catch(function(err) {
          writeAppLog('Sayfa yukleme hatasi: ' + err.message, 'ERROR');
        });
      }
    } else {
      retries++;
      writeAppLog('Backend hazir degil (HTTP ' + statusCode + '), 2 saniye sonra tekrar denenecek...');

      if (retries < MAX_RETRIES) {
        setTimeout(waitForBackend, 2000);
      } else {
        writeAppLog('Backend baslatilamadi! Maksimum deneme asildi.', 'ERROR');
        if (mainWindow) {
          var errorDetails = lastBackendError || 'Bilinmeyen hata';

          var relevantLogs = backendLogs.filter(function(l) {
            return l.indexOf('Error') >= 0 ||
              l.indexOf('error') >= 0 ||
              l.indexOf('Failed') >= 0 ||
              l.indexOf('Cannot') >= 0 ||
              l.indexOf('ENOENT') >= 0 ||
              l.indexOf('EADDRINUSE') >= 0 ||
              l.indexOf('Prisma') >= 0 ||
              l.indexOf('MODULE_NOT_FOUND') >= 0;
          });

          if (relevantLogs.length > 0) {
            errorDetails = relevantLogs.slice(-8).join('\n');
          }

          if (!lastBackendError && relevantLogs.length === 0) {
            errorDetails = 'Backend prosesi baslatilamadi.\n\nOlası nedenler:\n1. node.exe bulunamadi\n2. dist/index.js dosyasi eksik\n3. Veritabani baglantisi basarisiz\n4. Port 3001 kullanilamiyor\n\nDetaylar icin logs/app.log dosyasini kontrol edin.';
          }

          showDetailedError(
            'Sunucu Baslatma Hatasi',
            'Sunucu ' + MAX_RETRIES + ' deneme sonunda baslatilamadi.',
            errorDetails
          );
        }
      }
    }
  });
}

function startApp() {
  writeAppLog('====================================');
  writeAppLog('Uygulama baslatiliyor...');
  writeAppLog('====================================');
  writeAppLog('Electron versiyonu: ' + process.versions.electron);
  writeAppLog('Node versiyonu: ' + process.versions.node);
  writeAppLog('Chrome versiyonu: ' + process.versions.chrome);
  writeAppLog('Platform: ' + process.platform);
  writeAppLog('Arch: ' + process.arch);
  writeAppLog('isPackaged: ' + app.isPackaged);
  writeAppLog('appPath: ' + app.getAppPath());

  createWindow();
  startBackend();
  waitForBackend();
}

process.on('uncaughtException', function(err) {
  writeAppLog('YAKALANMAMIS ISTISNA: ' + err.message + '\n' + err.stack, 'ERROR');
  dialog.showErrorBox('Kritik Hata', 'Bir hata olustu:\n\n' + err.message);
});

process.on('unhandledRejection', function(reason) {
  var reasonStr = reason instanceof Error ? reason.message + '\n' + reason.stack : String(reason);
  writeAppLog('ISLENMEMIS REDDETME: ' + reasonStr, 'ERROR');
});

app.whenReady().then(startApp);

app.on('window-all-closed', function() {
  writeAppLog('Pencere kapatildi');
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', function() {
  writeAppLog('Uygulama kapatiliyor...');
  isQuitting = true;
  backendReady = false;
  if (backendProcess) {
    writeAppLog('Backend prosesi sonlandiriliyor...');
    backendProcess.kill();
  }
});

app.on('activate', function() {
  if (BrowserWindow.getAllWindows().length === 0) {
    startApp();
  }
});