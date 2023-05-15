const http = require('http'),
      PORT = process.env.PORT || 80,
      fileSystem = require('fs/promises')

const server = http.createServer(async (req, res) => {

  const url = new URL('https://localhost' + req.url)
  if(requestHandlers[url.pathname]) {
    const [statusCode, content, contentType = 'text/plain'] = requestHandlers[url.pathname](req, res, url)

    res.writeHead(statusCode, {'Content-Type': contentType})
    res.end(content)

    return
  }

  if(req.method === 'GET ') {
    if(url.pathname === '/') url.pathname = '/index.html'
    else if(url.pathname.match(/\..+/) === null) url.pathname += '.html'

    let statusCode = 200,
        content = ''

    try {
      content = await fileSystem.readFile(url.pathname)
    }
    catch(err) {
      statusCode = 500
      content = err
    }
  
    let contentType = 'text/plain'
  
    switch(url.pathname.match(/\..+$/)[0]) {
      case '.js':
        contentType = 'text/javascript'
        break
      case '.css':
        contentType = 'text/css'
        break
      case '.html':
        contentType = 'text/html'
        break
    }
  
    res.writeHead(statusCode, {'Content-Type': contentType})
    res.end(content)
  }

}).listen(PORT)

const requestHandlers {
  'test-comand' : async (req, res, url) => {
    try {
      retunr [200, url + 'is ok']
    }
    catch(err) {
      return [500, err.toString()]
    }
  }
}