// Tutorial Convert Curl -> Nodejs : https://curlconverter.com/#node-request
var request = require('request');
const email = require('../utilities/emaildispatch');
const Database = require('../DBconfig/Database');
var querystring = require('querystring');

module.exports = class PinGetter {
    constructor(name) {
        this.name = name;
        this.TransID = 1;
        this.email = "";
        this.expireDate = "";
    }

    PinGetterCom(OrderId, execute_res) {

        var dataString = 'username=apiNellaimob&password=2027$API@aeRs&transid=2020zx2007';
        var dataString1 = '';
        var res_data = '';
        var res_dataa = '';

        //  var TransID = Math.random().toString(36).substr(2, 9);

        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        };

        var options = {
            url: 'https://www.softapi.de/awsdemo/apiserver/apipins/api_demo.php?action=ShopCardList',
            method: 'POST',
            headers: headers,
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                res_data = JSON.parse(body);
                //    console.log(res_data.data.cardlist);

                res_data.data.cardlist.forEach(card => { // cardid , cardname, denomination, pprice & cardimage
                    if (card.cardname == 'Lyca Mobile' && card.denomination == '5.00') { // Price & Name 
                        let cardid = card.cardid;
                        this.TransID++;
                        //    console.log('ID : ' + cardid);
                        dataString1 = `username=apiNellaimob&password=2027$API@aeRs&cardid=${cardid}&quantity=1&transid=${this.TransID}`;
                    }
                });

                var options1 = {
                    url: 'https://www.softapi.de/awsdemo/apiserver/apipins/api_demo.php?action=RequestCardPin',
                    method: 'POST',
                    headers: headers,
                    body: dataString1
                };

                request(options1, callbackk);
            }
        }

        function callbackk(error, response, body) {  // cardid, batchnumber, pinnumber, expirydate, purchaseprice, transactionid.
            var Emaill = new email();
            let database = new Database(false);
            var RechargePin = '';

            if (!error && response.statusCode == 200) {
                //   console.log(" body : " + body);
                res_dataa = JSON.parse(body);
                //  console.log(" JSON : " + res_dataa.data.pinslist);

                database.ReadOrder(OrderId, results => {
                    console.log("Passed In ")
                    Emaill.FireEmail(OrderId, results[0].email, res_dataa.data.pinslist[0].pinnumber, res_dataa.data.pinslist[0].expirydate);

                    const query = querystring.stringify({
                        "Pin": res_dataa.data.pinslist[0].pinnumber,
                    });

                    execute_res.redirect('http://localhost:4200/sucess/?' + query);  // redirect to angualr page
                    console.log("Passed Out " +  res_dataa.data.pinslist[0].pinnumber);
                });

                //    console.log(" PIN : " + res_dataa.data.pinslist[0].pinnumber + ", Expiry Date : " + res_dataa.data.pinslist[0].expirydate);
                //return [res_dataa.data.pinslist[0].pinnumber, res_dataa.data.pinslist[0].expirydate];
            }
        }

        request(options, callback);

    }
}
