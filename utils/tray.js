const { app, Menu, nativeImage, Tray } = require("electron");
const path = require("path");

class TrayWrapper {
  tray = null;
  trayicon = null;
  constructor() {
    const icon = path.join(__dirname, '../icon.png');
    this.trayicon = nativeImage.createFromPath(icon);
  }
  initialize() {
    if (this.tray) {
      this.tray.destroy();
    }
    this.tray = new Tray(this.trayicon.resize({ width: 16 }));
  }
  showLoading() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Loading..'
      },
      {
        label: 'App Version: ' +  app.getVersion(),
        enabled: false
      }
    ]);
    this.tray.setContextMenu(contextMenu);
  }
  setContextMenu(menus) {
    const contextMenu = Menu.buildFromTemplate(menus);
    this.tray.setContextMenu(contextMenu);
  }
  destroy() {
    if (this.tray) {
      this.tray.destroy();
    }
  }
}
module.exports = new TrayWrapper();