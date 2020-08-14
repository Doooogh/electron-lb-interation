window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

 const remote = nodeRequire('electron').remote;
 var ipcRenderer = nodeRequire('electron').ipcRenderer;
 var currentWindow = remote.getCurrentWindow();
 const config = remote.require("./conf.js");

