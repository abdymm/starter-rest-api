const axios = require("axios")
const express = require("express")
const app = express()
const db = require("@cyclic.sh/dynamodb")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

// Get a travels
app.get("/travels", async (req, res) => {
  // Make a request for a user with a given ID
  try {
    const response = await axios.get(
      "https://simpu.kemenag.go.id/apps/api/travel"
    )

    const travels = response.data.travel

    // handle success
    const items = travels.map((item) => ({
      Put: {
        TableName: "clever-overallsCyclicDB",
        Item: item,
      },
    }))
    console.log("Bulk insert result - items:", items)
    // const result = await dynamoDB.batchWrite(items)
    // console.log("Bulk insert result:", result)
    res.json(response.data).end()
  } catch (error) {
    res.json(error).end()
  }
})

// Create or Update an item
app.post("/:col/:key", async (req, res) => {
  console.log(req.body)

  const col = req.params.col
  const key = req.params.key
  console.log(
    `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  )

  const item = await db.collection(col).set(key, req.body)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Delete an item
app.delete("/:col/:key", async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(
    `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  )
  const item = await db.collection(col).delete(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a single item
app.get("/:col/:key", async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(
    `from collection: ${col} get key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  )
  const item = await db.collection(col).get(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a full listing
app.get("/:col", async (req, res) => {
  const col = req.params.col
  console.log(
    `list collection: ${col} with params: ${JSON.stringify(req.params)}`
  )
  const items = await db.collection(col).list()
  console.log(JSON.stringify(items, null, 2))
  res.json(items).end()
})

// Catch all handler for all other request.
app.use("*", (req, res) => {
  res.json({ msg: "no route handler found" }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})
