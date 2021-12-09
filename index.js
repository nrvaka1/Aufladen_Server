require('dotenv').config()
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

console.log(stripeSecretKey, stripePublicKey);

const express = require('express');
const path = require('path');
const productsRouter = require('./routes/api/products');
const orderRouter = require('./routes/api/orders');
const cors = require('cors');
const cookieParse = require('cookie-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var ip = require('ip');

const storeItems = new Map([
    [1, { priceInCents: 10000, name: 'Learn React Today' }],
    [2, { priceInCents: 20000, name: 'Learn React Today' }],
])

console.log(" IP Addres  : " + ip.address());

const app = express();
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept'
}));
app.use(cookieParse());

// *** For Local Host *** 
// app.use('/api/products', productsRouter); // Baseline Address and hear after everything is added
// app.use('/api/orders', orderRouter); // Baseline Address and hear after everything is added

// *** For Remote Host ***
 app.use('/products', productsRouter); // Baseline Address and hear after everything is added
 app.use('/orders', orderRouter); // Baseline Address and hear after everything is added

const PORT = process.env.PORT || 3000;
app.listen(PORT);