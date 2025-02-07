const express= require('express');
const app = express();
require('dotenv').config;

const cors= require('cors');

app.use(express.json());
app.use(cors);

const port= 8080;

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})