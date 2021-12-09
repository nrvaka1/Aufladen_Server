const express = require('express');
const router = express.Router();
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID_PAYPAL,
    'client_secret': process.env.CLIENT_SECRET_PAYPAL
});

module.exports = class PayPalPay {

    constructor(name) {
        this.name = name;
        this.Purl = '';
    }

    async PPayment(req) {

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/api/orders/success",
                "cancel_url": "http://localhost:3000/api/orders/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Redhock Bar Soap",
                        "sku": "001",
                        "price": "30.00",
                        "currency": "EUR",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "EUR",
                    "total": "30.00"
                },
                "description": "Washing Bar soap"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            console.log("Payment");
            if (error) {
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        //    res.redirect(payment.links[i].href);
                        // res.json({ url: payment.links[i].href });
                        this.Purl = payment.links[i].href; 
                        console.log(" XBOX : " + payment.links[i].href + "( : )" + this.Purl)
                        return payment.links[i].href;
                    }
                }
            }
        });
    }
}

router.get('/success', (req, res) => {
    console.log("Executed");
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "EUR",
                "total": "30.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

router.get('/cancel', (req, res) => res.send('Cancelled'));