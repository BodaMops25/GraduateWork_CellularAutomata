import fileSystem from 'fs/promises'
import {USERS_CODES, HTTP_CODES} from './CODES.js'
import {Router, json} from 'express'

// WORK WITH FILE METHODS

async function readUsers() {
  return JSON.parse(await fileSystem.readFile('users.json'))
}

async function writeUsers(data) {
  return await fileSystem.writeFile('users.json', JSON.stringify(data, 0, 2))
}

async function getUser(userId) {
  const user = (await readUsers()).find(user => user.id === userId)

  if(user === undefined) {
    throw new Error(USERS_CODES.USER_NOT_EXIST)
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
    id: new Date(),
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
    if(propsObj[key]) user[key] = propsObj[key]
  }

  return user
}

// EXPRESS ROUTER FOR USERS

const usersRouter = Router()

usersRouter.use(json()) // for parsing post body

usersRouter.route('/users/user_:userId')
  .get(async (req, res) => {
    
    try {
      res.json(await getUser(+req.params.userId))
    }
    catch(err) {
      if(err.message === USERS_CODES.USER_NOT_EXIST) res.sendStatus(HTTP_CODES.NOT_FOUND)
      else res.status(HTTP_CODES.BAD_REQUEST).send('<pre>'+err.stack+'</pre>')
    }
  })
  .post(async (req, res) => {
    console.log(req.body)
  })

  export {getUser, createUser, deleteUser, updateUser, usersRouter}