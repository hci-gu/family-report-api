require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { Sequelize, Model, DataTypes } = require('sequelize')

const { DB_URI } = process.env

const sequelize = DB_URI
  ? new Sequelize({ uri: DB_URI })
  : new Sequelize('sqlite::memory:')

// setup API
const app = express()
app.use(bodyParser.json())

// setup models
sequelize.sync()
class User extends Model {}
User.init(
  {
    username: DataTypes.STRING,
  },
  { sequelize, modelName: 'user' }
)

app.get('/', (req, res) => res.send('Hello world'))

app.get('/users', async (req, res) => {
  const users = await User.findAll()

  res.send(users)
})

app.post('/users', async (req, res) => {
  const { username } = req.body
  const user = await User.create({ username })
  res.send(user)
})

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params
  console.log('DELETE', id)

  const user = await User.findOne({ where: { id } })
  console.log('found user', user)
  await user.destroy()

  res.sendStatus(200)
})

app.listen(8080)
