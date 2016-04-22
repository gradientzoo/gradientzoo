var express = require('express');
var compression = require('compression');
var httpProxy = require('http-proxy');
var forceDomain = require('forcedomain');

var app = new (express)()
var port = 3000

app.use(compression())

app.use('/static', express.static('dist'))

var proxy = httpProxy.createProxyServer({})
proxy.on('error', function(err, req, res) {
  console.log('PROXY ERROR: ' + err)
})

var forceDomainMiddleware = forceDomain({
  hostname: process.env.GRADIENTZOO_WWW_DOMAIN,
  protocol: 'https'
})

app.use(function(req, res, next) {
  var isHealthCheck = req.headers['user-agent'].match(/GoogleHC/)
  if (isHealthCheck) {
    next()
    return
  }
  if (req.hostname != process.env.GRADIENTZOO_WWW_DOMAIN ||
      req.headers['x-forwarded-proto'] != 'https') {
    req.hostname = 'invalid'
    forceDomainMiddleware(req, res, next)
  } else {
    next()
  }
})

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.use('/api', function(req, res) {
  proxy.web(req, res, {
    target: 'http://' + process.env.GRADIENTZOO_API_SVC_SERVICE_HOST + ':' + process.env.GRADIENTZOO_API_SVC_SERVICE_PORT
  })
})

app.use(function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})
