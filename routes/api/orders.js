require('dotenv').config();
const express = require('express');
const router = express.Router();
const app = express();
const Database = require('../../DBconfig/Database');
const stirpe = require('../../utilities/stripepay');
const paypal = require('paypal-rest-sdk');
const email = require('../../utilities/emaildispatch');
const pinGetter = require('../../utilities/pingetter');
const priceCal = require('../../utilities/priceCalculation');
var shortID = require('shortid');
var PriceForward = 10;
var ProductName = '';

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    //  'client_id': process.env.CLIENT_ID_PAYPAL,
    //  'client_secret': process.env.CLIENT_SECRET_PAYPAL
    'client_id': AWJRvh2BC13thsrsrt83lVKl2NTrlIOwvB6kFWmTK_Oj3z5m7nbrDqKpdEOLVQwNaHooqUHaGL-xAOz5,
    'client_secret': EHLnEzsNF5BzHseR1mP0J7hHvAbcBbzemVhn8wHgW9YFTpr-IIAs-Cg9uQM6OGZGsgaf-6S0wkpEDSKd
});

// Stripe 
//const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

// Send Email
const emailDispatch = require('../../utilities/emaildispatch')

// Step-1 (Payment Methods Initiate)

router.post('/checkout', async (req, res) => {
    var email = new emailDispatch();
    var Stripee = new stirpe();
    var Price = new priceCal();
    let database = new Database(false);

    // *********  Price Calculation **************
    console.log('**********************************************  ');

    let price = Price.PriceCal(req.body.Custdata[0].i);
    PriceForward = price[0]; ProductName = price[1];
    console.log('Price 2 .:. ' + price + '  Type 2  .:. ' + req.body.Custdata[0].c + '  PriceForward : ' + PriceForward + '  ID  .:. ' + req.body.Custdata[0].i);

    let emaill = "nrvaka1@gmail.com";
    id = shortID.generate(); OrdrID = id + between(1, 10000).toString();

    // *********  PayMent Details ****************

    if (req.body.Custdata[0].c == 'paypal') {   // Payment By Paypal       

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://127.0.0.1:4000/api/orders/paypalsuccess",
                // "return_url": "http://localhost:4200/sucess",
                "cancel_url": "http://127.0.0.1:4000/api/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": ProductName,
                        "sku": "001",
                        "price": PriceForward,
                        "currency": "EUR",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "EUR",
                    "total": PriceForward
                },
                "description": "Washing Bar soap"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {  //https://developer.paypal.com/docs/checkout/reference/server-integration/get-transaction/
            //   console.log(" Create : " + JSON.stringify(payment));
            console.log(" CLIENT_ID_PAYPAL : " + process.env.CLIENT_ID_PAYPAL);
            console.log(" CLIENT_SECRET_PAYPAL : " + process.env.CLIENT_SECRET_PAYPAL);
            console.log(" Create : " + payment.id);
            if (error) {
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        //    res.redirect(payment.links[i].href);
                        console.log(" OrderID 9490682682 : ");
                        res.json({ url: payment.links[i].href, OrderID: payment.id });
                        database.WriteOrder(payment.id, emaill, PriceForward, ProductName);
                    }
                }
            }
        });
        req.body.Custdata[0].c = "";
    } else if (req.body.Custdata[0].c == 'sofort') {  // Payment By Stripe (Bank Payment/ Direct debit/)

        let Stipe_url = await Stripee.Payment(req, 0, PriceForward, ProductName);
        console.log(" stripe URL sofort  : " + Stipe_url[1]);
        database.WriteOrder(Stipe_url[1], emaill, PriceForward, ProductName);
        res.json({ url: Stipe_url[0], OrderID: Stipe_url[1] });

    } else if (req.body.Custdata[0].c == 'card') {  // Payment By Stripe (Card)

        let Stipe_url = await Stripee.Payment(req, 1, PriceForward, ProductName);
        console.log(" stripe URL card  : " + Stipe_url[1]);
        database.WriteOrder(Stipe_url[1], emaill, PriceForward, ProductName);
        res.json({ url: Stipe_url[0], OrderID: Stipe_url[1] });

        /*    let Stipe_url = await Stripee.Payment(req, 1, PriceForward, ProductName);
            database.WriteOrder(OrdrID, emaill, PriceForward, ProductName);
            res.json({ url: Stipe_url, OrderID: OrdrID });*/
    } else if (req.body.Custdata[0].c == 'giro') {  // Payment By Stripe (GiroPay)

        let Stipe_url = await Stripee.Payment(req, 2, PriceForward, ProductName);
        console.log(" stripe URL giro  : " + Stipe_url[1]);
        database.WriteOrder(Stipe_url[1], emaill, PriceForward, ProductName);
        res.json({ url: Stipe_url[0], OrderID: Stipe_url[1] });

        /*    let Stipe_url = await Stripee.Payment(req, 1, PriceForward, ProductName);
            database.WriteOrder(OrdrID, emaill, PriceForward, ProductName);
            res.json({ url: Stipe_url, OrderID: OrdrID });*/
    }
});

// Step-2 (Payment Excecute For Paypal )

router.get('/paypalsuccess', (req, res) => {
    var PinGet = new pinGetter();
    let database = new Database(false);
    var RechargePin = "";

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(" payerId : " + payerId);
    console.log(" paymentId : " + paymentId);

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "EUR",
                "total": "10.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        console.log(" ************************************************** : ");
        //  console.log(" Excecution : " + payment.transactions[0].amount.total);
        //  console.log(" Excecution : " + payment.id);
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            //  console.log(JSON.stringify(payment));
            // res.send('sucess');redirect
            // res.send('http://localhost:4200/sucess');

            database.ConfirmOrderID(payment.id, results => {
                //  console.log(' Order ID Server : ' + results.valid);

                if (results.valid) {
                    RechargePin = PinGet.PinGetterCom(payment.id, res);
                    // console.log(' RechargePin : ' + RechargePin[0]);                   
                }
                else {
                    //      console.log(' Validation Rejected : ' + results.valid);
                }
            });
        }
    });
});

// Only for Stripe Send Email after Sucessful Payment 
router.get('/stripesuccess', async (req, res) => {
    var PinGet = new pinGetter();
    let database = new Database(false);
    let ID = "lkfzncjkdh0123"

    const paymentId = req.query.session_id;
    console.log(" paymentId stripe : " + paymentId);

    console.log("receipt Routes")
    // Check database for OrderID
    database.ConfirmOrderID(paymentId, results => {
        //  console.log(' Order ID Server : ' + results.valid);

        if (results.valid) {
            PinGet.PinGetterCom(paymentId, res);
            //  console.log(' Validation COnfirm : ' + results.valid);
        }
        else {
            //      console.log(' Validation Rejected : ' + results.valid);
        }
    });
    //  PinGet.PinGetterCom();
    // console.log(" Receipt Print " + req.body.Custdata[0].OI)
});

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

router.get('/cancel', (req, res) => res.send('Cancelled'));

module.exports = router;