const { program, InvalidOptionArgumentError } = require('commander')
const { app, BrowserWindow } = require("electron")
const fs = require('fs')
const path = require('path')
const { URL } = require('url')

const defaults = {
    URL: "http://localhost:3000/",
    width: 800,
    height: 600
}

const parseInteger = (value, dummyPrev) => {
    const parsedValue = parseInt(value, 10)
    if (isNaN(parsedValue)) {
        throw new InvalidOptionArgumentError('not an integer number')
    }
    return parsedValue
}

program
    .name('efw')
    .description('electron-frameless-window')
    .option("-w, --width <number>", "Window width", parseInteger, defaults.width)
    .option("-h, --height <number>", "Window heigth", parseInteger, defaults.height)
    .argument('[url]', 'URL to open in the window', defaults.URL)

program.parse()

const options = program.opts()

const stringIsAValidUrl = (s, protocols) => {
    try {
        url = new URL(s);
        return protocols
            ? url.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol)
                : false
            : true;
    } catch (err) {
        return false;
    }
}

const createWindow = (url) => {
    const win = new BrowserWindow({
        width: options.width,
        height: options.height,
        frame: false,
        resizable: false,
        transparent: true
    })

    // when in trouble debug it!
    // win.webContents.openDevTools({ mode: 'detach' })

    console.log(`loading url: ${url}`)
    win.loadURL(url)

    win.webContents.on('dom-ready', () => {
        win.webContents.insertCSS(fs.readFileSync(path.join(__dirname, 'index.css'), 'utf8'))
        console.log('CSS injected')
    })
}

app.whenReady().then(() => {
    var url = defaults.URL
    if (process.argv.length > 1 && process.argv[1] !== '.') {
        url = process.argv[1]
        if (!stringIsAValidUrl(url, ['http', 'https'])) {
            console.error(`invalid url: ${url}`)
            process.exit(1)
            return
        }
    }
    createWindow(url)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length == 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})