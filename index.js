const express= require('express');
const app = express();
require('dotenv').config;
const bodyParser= require('body-parser')

const cors= require('cors');

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const port= 8080;

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})