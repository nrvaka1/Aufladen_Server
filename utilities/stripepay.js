const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
let shortID = require('shortid');

module.exports = class StripePay {
    constructor(name) {
        this.name = name;
        this.Id = shortID.generate();
    }

    async Payment(req, Mode, Price, ProductName) {

        const storeItems = new Map([
            [1, { priceInCents: 100 * Price, name: ProductName }],
            //   [2, { priceInCents: 2000, name: 'Learn CSS Today' }],
        ])

        if (Mode == 0) { // SOrfort 

            const session = await stripe.checkout.sessions.create({
                //  payment_method_types: ['ideal'],
                payment_method_types: ['sofort'],
                mode: 'payment',
                line_items: req.body.items.map(item => {
                    const storeItem = storeItems.get(item.id)
                    return {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: storeItem.name
                                // name: 'Learn CSS Today'
                            },
                            unit_amount: storeItem.priceInCents
                            //  unit_amount: 1000
                        },
                        quantity: item.quantity
                    }
                }),
                // success_url: `${process.env.CLIENT_URL}/success.html`,
                //  cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
                //  success_url: "http://localhost:4200/sucess",
                success_url: "http://localhost:3000/api/orders/stripesuccess?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
            })
            console.log(' session : ' + session.id);
            return [session.url, session.id]
            //console.log("Hello : " + session.url);
        } else if (Mode == 1) { // Card

            const session = await stripe.checkout.sessions.create({
                //  payment_method_types: ['ideal'],
                //  payment_method_types: ['card', 'sofort','giropay'],
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: req.body.items.map(item => {
                    const storeItem = storeItems.get(item.id)
                    return {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: storeItem.name
                                // name: 'Learn CSS Today'
                            },
                            unit_amount: storeItem.priceInCents
                            // unit_amount: 1000
                        },
                        quantity: item.quantity
                    }
                }),
                // success_url: `${process.env.CLIENT_URL}/success.html`,
                //  cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
                success_url: "http://localhost:3000/api/orders/stripesuccess?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
            })
            //console.log("Hello : " + session.url);
            return [session.url, session.id]
        } else if (Mode == 2) { // GiroPay

            const session = await stripe.checkout.sessions.create({
                //  payment_method_types: ['ideal'],
                //  payment_method_types: ['card', 'sofort','giropay'],
                payment_method_types: ['sofort'],
                mode: 'payment',
                line_items: req.body.items.map(item => {
                    const storeItem = storeItems.get(item.id)
                    return {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: storeItem.name
                                // name: 'Learn CSS Today'
                            },
                            unit_amount: storeItem.priceInCents
                            // unit_amount: 1000
                        },
                        quantity: item.quantity
                    }
                }),
                // success_url: `${process.env.CLIENT_URL}/success.html`,
                //  cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
                success_url: "http://localhost:3000/api/orders/stripesuccess?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
            })
            //console.log("Hello : " + session.url);
            return [session.url, session.id]
        }
    }
}
