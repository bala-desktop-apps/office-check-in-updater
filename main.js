const { app, Notification, powerMonitor, autoUpdater } = require("electron");
const logger = require('./utils/logger');
const fetchSSID = require('./utils/fetchSSID');
const getNTID = require('./utils/getNTID');
const tray = require('./utils/tray');
const { checkAttendence, sendAttendence } = require('./utils/api');
const AutoLaunch = require('auto-launch');

const checkInOffice = (ntid, ssid) => {
  sendAttendence(ntid, ssid).then((data) => {
    new Notification({ title: 'Thanks for check-in to office today!' }).show();
    const menus = getMenus(ntid, ssid, data.isAlreadyCheckIn, data.inOfficeNetwork );
    tray.setContextMenu(menus);
  });
};
const getMenus = (ntid, ssid, isAlreadyCheckIn, inOfficeNetwork) => {
  return [
    {
      label: 'Hello ' + ntid
    },
    {
      label: isAlreadyCheckIn? 'Already check-in for today' : 'Please check-in for today',
      enabled: !isAlreadyCheckIn && inOfficeNetwork,
      visible: inOfficeNetwork,
      click: () => {
        checkInOffice(ntid, ssid);
      }
    },
    {
      label: inOfficeNetwork ? 'In office' : 'Out of office',
      enabled: false
    },
    {
      label: 'App Version: ' +  app.getVersion(),
      enabled: false
    }
  ];
};

const appInit = () => {
  tray.initialize();
  tray.showLoading();
  fetchSSID().then((ssid) => {
    const ntid = getNTID();
    checkAttendence(ntid, ssid).then((data) => {
      const menus = getMenus(ntid, ssid, data.isAlreadyCheckIn, data.inOfficeNetwork );
      tray.setContextMenu(menus);
      if (!data.isAlreadyCheckIn && data.inOfficeNetwork) {
        checkInOffice(ntid, ssid);
      }
    });
  });
}
powerMonitor.on('resume', () => {
  logger.info("System is resuming..");
  setTimeout(() => {
    appInit();
    autoUpdater.checkForUpdates();
  }, 5*60*1000); // after 5 mins, it will automatically check-in if user in office
});
powerMonitor.on('unlock-screen', () => {
  logger.info("You are unlocking the screen..");
  setTimeout(() => {
    appInit();
    autoUpdater.checkForUpdates();
  }, 5*60*1000); // after 5 mins, it will automatically check-in if user in office
});
app.whenReady().then(() => {
  logger.info("App was ready");
  appInit();
});
app.on("window-all-closed", () => {
  app.dock.hide()
});
app.on("activate", () => {
  logger.info("App was activated");
  appInit();
});
app.on('before-quit', function () {
  tray.destroy();
});
app.setLoginItemSettings({
  openAtLogin: true
});
autoUpdater.on("update-downloaded", () => {
  logger.info("Downloaded available");
  autoUpdater.quitAndInstall();  
});

const autoLauncher = new AutoLaunch({
  name: "OfficeInCheck"
});
// Checking if autoLaunch is enabled, if not then enabling it.
autoLauncher.isEnabled().then(function (isEnabled) {
  logger.info("Is auto enabled?", isEnabled);
  if (isEnabled) return;
  autoLauncher.enable();
}).catch(function (err) {
  logger.error(`exec error: ${err}`);
  throw err;
});
