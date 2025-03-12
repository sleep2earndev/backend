const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_CORS?.split(',') || '',
  credentials: true, // Wajib untuk mengizinkan cookie
}
app.use(cookieParser())
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

const userRouter = require('./router/UserRouter');
const nftRouter = require('./router/NftRouter');
app.use('/user', userRouter);
app.use('/nft', nftRouter);


app.listen(process.env.PORTAPPS, () => {
  console.log(`server is running on port ${process.env.PORTAPPS}`);
})