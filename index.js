const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




// Root
app.get('/', (req, res) => {
    res.send('YourStock server is running')
})

app.listen(port, () => {
    console.log('Listening to ', port)
})