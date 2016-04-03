var ipcMain = require('electron').ipcMain

function Server (webContents) {
  this.methods = {}
  this.webContents = webContents

  this._requestMessageHandler = requestMessageHandler.bind(this)
  ipcMain.on('request-message', this._requestMessageHandler)
}

Server.prototype.send = function (action, body) {
  var response = {action: action, body: body}
  sendResponse.call(this, response)
}

function sendResponse (response) {
  if (!this.webContents) return console.error(new Error("The electron-rpc Server isn't configured. Please use server.configure(eventEmitter)"))
  this.webContents.send('response-message', response)
}

Server.prototype.configure = function (webContents) {
  this.webContents = webContents
  return this
}

Server.prototype.on = function (action, callback) {
  this.methods[action] = callback
  return this
}

Server.prototype.destroy = function () {
  this.methods = {}
  this.webContents = undefined
  ipcMain.removeListener('request-message', this._requestMessageHandler)
}

function requestMessageHandler (evt, data) {
  var self = this
  var response = {id: data.id, action: data.action}
  var request = {id: data.id, action: data.action, body: data.body}
  var actionHandler = self.methods[request.action]
  if (!actionHandler) {
    response.error = {message: 'Route not found', statusCode: 404}
    return sendResponse.call(self, response)
  } else {
    actionHandler(request, function (error, body) {
      response.error = error
      response.body = body
      sendResponse.call(self, response)
    })
  }
}

module.exports = Server

