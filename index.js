const express= require('express');
const app = express();
require('dotenv').config();
const bodyParser= require('body-parser')
const cookieParser = require('cookie-parser')
const cors= require('cors');

const corsOptions = {
    origin: "https://snoorefi.syaad.dev", 
    credentials: true, // Wajib untuk mengizinkan cookie
  }
app.use(cookieParser())
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

const userRouter= require('./router/UserRouter');
app.use('/user', userRouter);


app.listen(process.env.PORTAPPS,()=>{
    console.log(`server is running on port ${process.env.PORTAPPS}`);
})