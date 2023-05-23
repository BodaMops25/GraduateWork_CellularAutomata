const http = require('http'),
      PORT = process.env.PORT || 80,
      fileSystem = require('fs/promises')

const server = http.createServer(async (req, res) => {

  const url = new URL('https://localhost' + req.url)
  let resoursePath = url.pathname.replace(/^\//, '')

  if(requestHandlers[resoursePath]) {
    const [statusCode, content, contentType = 'text/plain'] = await requestHandlers[resoursePath](req, res, url)

    res.writeHead(statusCode, {'Content-Type': contentType})
    res.end(content)

    return
  }

  if(req.method === 'GET') {
    if(resoursePath === '') resoursePath = 'index.html'
    else if(resoursePath.match(/\..+/) === null) resoursePath += '.html'

    let statusCode = 200,
        content = ''

    try {
      content = await fileSystem.readFile(resoursePath)
    }
    catch(err) {
      if(err.errno === -4058 && err.code === 'ENOENT') {
        statusCode = 404
        content += '<h1>File not found</h1>'
        content += '<h3>' + err.toString() + '</h3>'
      }
      else {
        statusCode = 500
        content += '<h1>Server error</h1>'
        content += '<h3>' + err.toString() + '</h3>'
      }
    }
  
    let contentType = 'text/plain'
  
    switch(resoursePath.match(/\..+$/)[0]) {
      case '.js':
        contentType = 'text/javascript'
        break
      case '.css':
        contentType = 'text/css'
        break
      case '.html':
        contentType = 'text/html'
        break
      case '.svg':
        contentType = 'image/svg+xml'
        break
    }
  
    res.writeHead(statusCode, {'Content-Type': contentType})
    res.end(content)
  }

}).listen(PORT)

const requestHandlers = {
  'test-command' : async (req, res, url) => {
    try {
      return [200, url + ': is ok']
    }
    catch(err) {
      return [500, err.toString()]
    }
  }
}