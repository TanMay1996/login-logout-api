require('dotenv').config();

const express = require('express')
const cors = require('cors')
const app = express()
const errorHandler = require('./middlewares/errorHandler');

let port = process.env.PORT || 4000
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//routes
app.use('/user', require('./routes/user'));

//route not found
app.use((req, res) => {
    res.status(404).send({ error: 'Invalid Request' });
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`< < < < < API Server is up on port: ${port} > > > > >`)
})