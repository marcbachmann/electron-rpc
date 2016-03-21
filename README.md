# electron-rpc

A lightweight wrapper around the ipc module of electron

This module is only compatible with [Electron](https://github.com/atom/electron). It won't work in nodejs directly.


Please use electron-rpc@v2.0.0 if you're using [electron >= v0.35.0](https://github.com/atom/electron/releases/tag/v0.35.0). The ipc module api changed with that version.


#### Server API
```
var Server = require('electron-rpc/server')
var server = new Server()
server.configure(webContents)
server.send(action[, body])
server.on(action, callback)
server.destroy()
```

#### Client API
```
var Client = require('electron-rpc/client')
var client = new Client()
client.request(action[, body][, callback])
client.on(action, callback)
client.removeListener(action, callback)
client.destroy()
```

#### Usage
##### Server side
```
var Server = require('electron-rpc/server')
var app = new Server()
app.configure(window.webContents) // pass a BrowserWindow.webContents[1] object

app.on('some-action', function(req, next){
  // req consists of id, action, body
  someAsyncRequest(function(err, data){
    if (err) return next(err)
    next(null, data)
  })
})

app.on('some-action-without-callback', function(req){
    console.log('foo')
})

// You can also send messages without triggering a request on the client
app.send('some-server-message', 'bar')
```

Here's the documentation about the [BrowserWindow.webContents](https://github.com/atom/electron/blob/master/docs/api/browser-window.md#browserwindowwebcontents) object.

##### Client side
```
var Client = require('electron-rpc/client')
client = new Client()

client.request('some-action', function(err, body) {
  console.log('Error from someAsyncRequest:', err)
  console.log('Body from someAsyncRequest:', body)
})


client.request('some-action-without-callback')

client.on('some-server-message', function(err, body){
    console.log('foo:', body)
})
```



To close the connections, you can use `server.destroy()` or `client.destroy()`.
