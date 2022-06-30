const AWS = require("aws-sdk")
const express = require("express")
const serverless = require("serverless-http")

const app = express()

const USERS_TABLE = process.env.USERS_TABLE
const dynamoDbClient = new AWS.DynamoDB.DocumentClient()

app.use(express.json())

app.get("/users/:userId", async function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }

  try {
    // Busca do usuário pelo Id
    const { Item } = await dynamoDbClient.get(params).promise()
    if (Item) {
      const { userId, name } = Item

      console.log('Usuário encontrado com sucesso.')

      res.json({ userId, name })
    } else {
      console.error('Usuário não encontrado.')
      res
        .status(404)
        .json({ error: 'Não foi encontrado usuário com este id' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Não foi possível obter o usuário." })
  }
})

app.post("/users", async function (req, res) {
  const { userId, name } = req.body
  if (typeof userId !== "string") {
    console.error('O campo deverá ser uma string.')
    res.status(400).json({ error: 'O campo deverá ser uma string.' })
  } else if (typeof name !== "string") {
    console.error('O nome deverá ser uma string.')
    res.status(400).json({ error: 'O nome deverá ser uma string.' })
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: userId,
      name: name,
    },
  }

  try {
    // Inserção de dados no banco
    await dynamoDbClient.put(params).promise()
    console.log('Usuário criado com sucesso.')
    res.json({ userId, name })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Não foi possível criar o usuário" })
  }
})

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  })
})


module.exports.handler = serverless(app)
