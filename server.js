// const http = require('http'),
//       PORT = process.env.PORT || 80,
//       fileSystem = require('fs/promises')

// const server = http.createServer(async (req, res) => {

//   const url = new URL('https://localhost' + req.url)
//   let resoursePath = url.pathname.replace(/^\//, '')

//   if(requestHandlers[resoursePath]) {
//     const [statusCode, content, contentType = 'text/plain'] = await requestHandlers[resoursePath](req, res, url)

//     res.writeHead(statusCode, {'Content-Type': contentType})
//     res.end(content)

//     return
//   }

//   if(req.method === 'GET') {
//     if(resoursePath === '') resoursePath = 'index.html'
//     else if(resoursePath.match(/\..+/) === null) resoursePath += '.html'

//     let statusCode = 200,
//         content = ''

//     try {
//       content = await fileSystem.readFile(resoursePath)
//     }
//     catch(err) {
//       if(err.errno === -4058 && err.code === 'ENOENT') {
//         statusCode = 404
//         content += '<h1>File not found</h1>'
//         content += '<h3>' + err.toString() + '</h3>'
//       }
//       else {
//         statusCode = 500
//         content += '<h1>Server error</h1>'
//         content += '<h3>' + err.toString() + '</h3>'
//       }
//     }
  
//     let contentType = 'text/plain'
  
//     switch(resoursePath.match(/\..+$/)[0]) {
//       case '.js':
//         contentType = 'text/javascript'
//         break
//       case '.css':
//         contentType = 'text/css'
//         break
//       case '.html':
//         contentType = 'text/html'
//         break
//       case '.svg':
//         contentType = 'image/svg+xml'
//         break
//     }
  
//     res.writeHead(statusCode, {'Content-Type': contentType})
//     res.end(content)
//   }

// }).listen(PORT)

// const requestHandlers = {
//   'test-command' : async (req, res, url) => {
//     try {
//       console.log('is test command done')
//       return [200, url + ': is ok']
//     } 
//     catch(err) {
//       return [500, err.toString()]
//     }
//   }
// }


import express from 'express'
import fileSystem from 'fs/promises'
import path from 'path'
import {usersRouter} from './users.js'

const __dirname = path.resolve()


const PORT = process.env.PORT || 80,
      app = express()

app.use(express.static(path.resolve(__dirname, 'static_web')))
app.use('/resources', express.static(path.resolve(__dirname, 'resources')))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'static_web', 'index.html'))
})

app.use(usersRouter)

app.listen(PORT, () => {
  console.log('Server running on port', PORT)
})