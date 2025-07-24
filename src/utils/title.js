const handleSetTitle = (win, title) => {
  // const webContents = event.sender;
  // const win = BrowserWindow.fromWebContents(webContents);

  win.setTitle(title)
}

module.exports = handleSetTitle
