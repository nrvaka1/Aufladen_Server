const nodemailer = require('nodemailer');

module.exports = class EmailDispatch {
    constructor(name) {
        this.name = name;
    }

    FireEmail(orderid, email, pin, expirydate) {
        var phonenumber = "978949560276"

        var transporter = nodemailer.createTransport({
            host: "gmail.com", // hostname
            secure: false, // use SSL
            port: 25, // port for secure SMTP
            service: 'gmail',
            auth: {
                user: 'nrvaka1@gmail.com',
                pass: 'reddy@1234'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Tutorial: Send Html & attachment tutorials -- https://www.youtube.com/watch?v=c7QscDpiS5Q&ab_channel=S.G.Codes

        var mailOptions = {
            from: 'nrvaka1@gmail.com',
            to: email,
            subject: 'Recharge Pin from Recharge',
            html: ` 
       <p> Dear Customer, <br /> </p>

       <p> Greetings !! <br /> </p>

       <p> Thank you for recharging with Recharge,  below is your recharge details <br /> </p>
        
      
        Reference ID : ${orderid} <br />
        Pin : ${pin} <br />
        Expiry Date : ${expirydate} <br />

        <p> Thank you, <br /> Best Regards <br /> Reacharge Online Recharge   </p>

         `,
            // Array which take different objetcs pdf / image ...
            attachments: [
                {
                    filename: 'Invoice.pdf',
                    path: 'assets/INVoice.pdf',
                    contentType: 'application/pdf'
                }
            ]
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Email Error : ' + error);
            } else {
                console.log('Email sent : ' + info.response);
            }
        });

    }
}
