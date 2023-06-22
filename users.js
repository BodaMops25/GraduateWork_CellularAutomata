import fileSystem from 'fs/promises'
import {USERS_CODES, HTTP_CODES} from './CODES.js'
import {config} from './config.js'
import {Router, json} from 'express'

// WORK WITH FILE METHODS

async function readUsers() {
  return JSON.parse(await fileSystem.readFile('users.json'))
}

async function writeUsers(data) {
  return await fileSystem.writeFile('users.json', JSON.stringify(data, 0, 2))
}

async function getUser(userIdentificator) {
  const user = (await readUsers()).find(user => user.id === +userIdentificator || user.name === userIdentificator)

  if(user === undefined) {
    throw new Error(USERS_CODES.USER_NOT_EXIST + ' -> user-id: ' + userIdentificator)
    return
  }
  return user
}

async function createUser(userObj) {
  const users = await readUsers()
    
  if(users.find(user => user.name === userObj.name) !== undefined) {
    throw new Error(USERS_CODES.NAME_BUSY)
    return
  }

  const user = {
    id: +new Date(),
    name: userObj.name,
    pass: userObj.pass.toString(),
    projects: [],
    blueprints: []
  }

  users.push(user)
  await writeUsers(users)

  return user
}

async function deleteUser(userIdentificator) {
  const users = await readUsers(),
        userIndex = users.findIndex(user => user.id === +userIdentificator || user.name === userIdentificator)

  if(userIndex === -1) {
    throw new Error(USERS_CODES.USER_NOT_EXIST)
    return
  }

  users.splice(userIndex, 1)
  await writeUsers(users)

  return true
}

async function updateUser(userIdentificator, propsObj) {
  const users = await readUsers(),
        user = users.find(user => user.id === userIdentificator || user.name === userIdentificator)

  if(user === undefined) {
    throw new Error(USERS_CODES.USER_NOT_EXIST)
    return
  }

  if(userIdentificator !== propsObj.name && users.find(user => user.id === +propsObj.name || user.name === propsObj.name) !== undefined) {
    throw new Error(USERS_CODES.NAME_BUSY)
    return
  }

  if(propsObj.name) user.name = propsObj.name
  if(propsObj.pass) user.pass = propsObj.pass.toString()
  if(propsObj.projects) user.projects = propsObj.projects
  if(propsObj.blueprints) user.name = blueprintsropsObj.blueprints

  await writeUsers(users)
  return user
}

async function checkAuth(userIdentificator, pass) {
  const user = await getUser(userIdentificator)
  if(user.pass === pass) return true
  return false
}

// EXPRESS ROUTER FOR USERS

async function errorsWrapper(res, func) {
  try {
    await func()
  }
  catch(err) {
    if(err.message.includes(USERS_CODES.USER_NOT_EXIST)) res.sendStatus(HTTP_CODES.NOT_FOUND)
    else if(err.message.includes(USERS_CODES.NAME_BUSY)) res.status(HTTP_CODES.BAD_REQUEST).send(USERS_CODES.NAME_BUSY)
    else {
      res.sendStatus(HTTP_CODES.INTERNAL_SERVER_ERROR)
      console.log(err)
    }
  }
}

const usersRouter = Router()

usersRouter.use(json()) // for parsing post body

usersRouter.route('/users')
  .post(async (req, res) => {
    await errorsWrapper(res, async () => {
      const {name, pass} = req.body

      if(!name) res.status(HTTP_CODES.BAD_REQUEST).send('Name is invalid or empty')
      else if(pass.length < config.pass_min_length || config.pass_max_length < pass.length) {
        res.status(HTTP_CODES.BAD_REQUEST).send('Pass is not in ' + config.pass_min_length + '-' + config.pass_max_length + ' range length')
      }
      else {
        const user = await createUser({
          name: name,
          pass: pass
        })
        res.status(HTTP_CODES.OK).send(user)
      }
    })
  })
  .put(async (req, res) => {
    await errorsWrapper(res, async () => {
      if(!req.body || !req.body.auth || !req.body.body) {
        res.status(HTTP_CODES.BAD_REQUEST).send('Invalud req.body or req.body.auth or req.body.body')
        return
      }

      const {name, pass} = req.body.auth,
            props = req.body.body

      if(!await checkAuth(name, pass)) {
        res.sendStatus(HTTP_CODES.UNAUTHORIZED)
        return
      }

      if(props.pass) {
        if(props.pass.length < config.pass_min_length || config.pass_max_length < props.pass.length) {
          res.status(HTTP_CODES.BAD_REQUEST).send('Pass is not in ' + config.pass_min_length + '-' + config.pass_max_length + ' range length')
          return
        }
      }

      res.json(await updateUser(name, props))
    })
  })
  .delete(async (req, res) => {
    await errorsWrapper(res, async () => {

      if(!req.body) {
        res.status(HTTP_CODES.BAD_REQUEST).send('Invalud req.body')
        return
      }

      const {name, pass} = req.body

      if(!await checkAuth(name, pass)) {
        res.sendStatus(HTTP_CODES.UNAUTHORIZED)
        return
      }

      await deleteUser(name)
      res.sendStatus(HTTP_CODES.OK)
    })
  })

usersRouter.get('/users/:userId', async (req, res) => {
  await errorsWrapper(res, async () => {
    res.json(await getUser(req.params.userId))
  })
})

export {getUser, createUser, deleteUser, updateUser, usersRouter}