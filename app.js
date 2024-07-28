/*
 *  Created a Table with name todo in the todoApplication.db file using the CLI.
 */

const express = require('express')
const cors = require('cors');
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'transactions.db')

const app = express()

app.use(cors());
app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    const port = process.env.PORT || 3002
    app.listen(port, () =>
      console.log(`Server Running at http://localhost:${port}/`),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

app.get('/transactions/', async (request, response) => {
  const getTransactionQuery = `
    SELECT
      *
    FROM
      transactions
    ORDER BY 
      id DESC;`
  const transactions = await database.all(getTransactionQuery) // Use `all` instead of `get` to fetch all rows
  response.send(transactions)
})

app.post('/transactions/', async (request, response) => {
  const {id, type, amount, description, date} = request.body

  // Fetch the current balance
  const getBalanceQuery = `SELECT running_balance FROM transactions ORDER BY id DESC LIMIT 1;`
  const lastTransaction = await database.get(getBalanceQuery)
  let balance = lastTransaction ? lastTransaction.running_balance : 0

  if (type === 'credit') {
    balance += amount
  } else if (type === 'debit') {
    balance -= amount
  } else {
    return response.status(400).send('Invalid transaction type')
  }

  const postTransactionQuery = `
    INSERT INTO
      transactions (id, type, amount, description, date, running_balance)
    VALUES
      ('${id}', '${type}', ${amount}, '${description}', '${date}', ${balance});`

  await database.run(postTransactionQuery)
  response.send('Transaction Successfully Added')
})

module.exports = app
