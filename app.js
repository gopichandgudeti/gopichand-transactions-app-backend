/*
 *  Created a Table with name todo in the todoApplication.db file using the CLI.
 */

const express = require('express')
const cors = require('cors')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'transactions.db')

const app = express()

app.use(cors())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
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
  const transactions = await database.get(getTransactionQuery)
  
  response.send(transactions)
})

app.post('/transactions/', async (request, response) => {
  const {type, amount, description, date} = request.body

  let balance = 0;

  if (type === "credit") {
    balance += amount;
  } else if (type === "debit") {
    balance -= amount
  }
  
  const postTransactionQuery = `
  INSERT INTO
    transactions (id, type, amount, description, date, running_balance)
  VALUES
    (id: this.lastID, '${type}', '${amount}', '${description}', '${date}', '${balance}');`
  await database.run(postTransactionQuery)
  response.send('Transaction Successfully Added')
})

module.exports = app
