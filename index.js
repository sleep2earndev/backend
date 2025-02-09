const express= require('express');
const app = express();
// require('dotenv').config();
const bodyParser= require('body-parser')

const cors= require('cors');

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const userRouter= require('./router/UserRouter');
app.use('/user', userRouter);

const port= 4000;

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})