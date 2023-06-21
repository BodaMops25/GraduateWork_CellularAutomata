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
  const user = (await readUsers()).find(user => user.id === userIdentificator || user.name === userIdentificator)

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
    pass: userObj.pass,
    projects: [],
    blueprints: []
  }

  users.push(user)
  await writeUsers(users)

  return user
}

async function deleteUser(deleteUserId) {
  const users = await readUsers(),
        userIndex = users.findIndex(user => user.id === deleteUserId)

  if(userIndex === -1) {
    throw new Error(USERS_CODES.USER_NOT_EXIST)
    return
  }

  users.splice(userIndex, 1)
  await writeUsers(users)

  return true
}

async function updateUser(userId, propsObj) {
  const users = await readUsers(),
        user = users.find(user => user.id === userId)

  if(user === undefined) {
    throw new Error(USERS_CODES.USER_NOT_EXIST)
    return
  }

  for(const key in user) {
    if(propsObj[key] !== undefined) user[key] = propsObj[key]
  }

  return user
}

// EXPRESS ROUTER FOR USERS

async function errorsWrapper(res, func) {
  try {
    await func()
  }
  catch(err) {
    if(err.message.includes(USERS_CODES.USER_NOT_EXIST)) res.sendStatus(HTTP_CODES.NOT_FOUND)
    else {
      res.sendStatus(HTTP_CODES.INTERNAL_SERVER_ERROR)
      console.log(err)
    }
  }
}

const usersRouter = Router()

usersRouter.use(json()) // for parsing post body

usersRouter.route('/users/user_:userId')
  .get(async (req, res) => {
    await errorsWrapper(res, async () => {

      res.json(await getUser(+req.params.userId))

    })
  })
  .post(async (req, res) => {
    await errorsWrapper(res, async () => {
      try {
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
      }
      catch (err) {
        if(err.message === USERS_CODES.NAME_BUSY) res.status(HTTP_CODES.BAD_REQUEST).send(USERS_CODES.NAME_BUSY)
        else throw err
      }
    })
  })
  .put(async (req, res) => {
    await errorsWrapper(res, async () => {
      await updateUser(+req.params.userId, req.body)
      res.json(await getUser(+req.params.userId))
    })
  })

  export {getUser, createUser, deleteUser, updateUser, usersRouter}