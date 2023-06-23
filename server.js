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