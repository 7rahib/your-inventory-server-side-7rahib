const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5dwt7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const inventoryCollection = client.db('yourInventory').collection('inventory')

        // JWT token generator
        app.post('/login', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })

        // Getting All Items with pagination
        app.get('/inventory', async (req, res) => {
            const query = {}
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const cursor = inventoryCollection.find(query)
            let inventory;
            if (page || size) {
                inventory = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                inventory = await cursor.toArray()
            }

            res.send(inventory)
        })

        // Getting inventory count for pagination
        app.get('/inventorycount', async (req, res) => {
            const count = await inventoryCollection.estimatedDocumentCount()
            res.send({ count })
        })

        // Getting Individual Item
        app.get('/inventory/:_id', async (req, res) => {
            const _id = req.params._id
            const query = { _id: ObjectId(_id) }
            const inventory = await inventoryCollection.findOne(query)
            res.send(inventory)
        })

        // Adding Item
        app.post('/inventory', async (req, res) => {
            const newItem = req.body
            const result = await inventoryCollection.insertOne(newItem)
            res.send(result)
        })

        // Delete Item
        app.delete('/inventory/:id', async (req, res) => {
            const _id = req.params.id;
            const query = { _id: ObjectId(_id) }
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        })

        // Getting User's added inventories item
        app.get('/myitems', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = inventoryCollection.find(query)
            const myItems = await cursor.toArray()
            res.send(myItems)
        })

        // Updating inventory quantity
        app.put('/inventory/:_id', async (req, res) => {
            const _id = req.params._id
            const filter = { _id: ObjectId(_id) }
            const newQuantity = req.body.quantity
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    quantity: parseInt(newQuantity)
                }
            }

            const result = await inventoryCollection.updateOne(filter, updatedDoc, options)
            res.send(result)

        })


    }
    finally {

    }

}

run().catch(console.dir)


// Root
app.get('/', (req, res) => {
    res.send('YourStock server is running')
})

app.listen(port, () => {
    console.log('Listening to ', port)
})