'use strict'

const { serve } = require('micro')
const http = require('http')

const server = new http.Server(serve(async function (req, res) {
  return { hello: 'world' }
}));

server.listen(3000)
