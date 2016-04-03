var events = require('events')
var ipcRenderer = require('electron').ipcRenderer

function Client () {
  this.requests = {}
  this.remoteEventEmitter = ipcRenderer
  this.localEventEmitter = new events.EventEmitter()
  this._responseMessageHandler = responseMessageHandler.bind(this)
  this.remoteEventEmitter.on('response-message', this._responseMessageHandler)
}

Client.prototype.request = function (action, body, callback) {
  if (typeof body === 'function') {
    callback = body
    body = undefined
  }

  var id = Math.random().toString(16).slice(2)
  var request = {id: id, action: action, body: body}
  this.remoteEventEmitter.send('request-message', request)

  // We can only handle requests with a callback
  if (callback) {
    this.requests[request.id] = request
    this.requests[request.id].callback = callback
  }
}

Client.prototype.on = function (action, callback) {
  this.localEventEmitter.on('response-message:' + action, callback)
}

Client.prototype.removeListener = function (action, callback) {
  this.localEventEmitter.removeListener('response-message:' + action, callback)
}

Client.prototype.destroy = function () {
  this.localEventEmitter.removeAllListeners()
  this.remoteEventEmitter.removeListener('response-message', this._responseMessageHandler)
}

function responseMessageHandler (evt, response) {
  this.localEventEmitter.emit('response-message:' + response.action, response.error, response.body)
  if (response.id) {
    var request = this.requests[response.id]
    if (request && request.callback) request.callback(response.error, response.body)
    this.requests[response.id] = undefined
  }
}

module.exports = Client
