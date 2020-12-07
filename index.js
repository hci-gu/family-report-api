require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { Sequelize, Model, DataTypes } = require('sequelize')

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB } = process.env

if (DB) {
  console.log('connecting to', {
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB,
  })
}
const sequelize = DB
  ? new Sequelize({
      database: DB,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize('sqlite::memory')

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
  console.log('GET /users')

  try {
    const users = await User.findAll()

    res.send(users)
  } catch (err) {
    res.send(err.message)
  }
})

app.post('/users', async (req, res) => {
  console.log('POST /users', req.body)
  try {
    const { username } = req.body
    const user = await User.create({ username })
    res.send(user)
  } catch (err) {
    res.send(err.message)
  }
})

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('DELETE /users/:id', id)

    const user = await User.findOne({ where: { id } })
    await user.destroy()

    res.sendStatus(200)
  } catch (err) {
    res.send(err.message)
  }
})

app.listen(8080)
