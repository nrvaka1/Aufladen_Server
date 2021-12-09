let Mysql = require('mysql')
let DatabaseSettingsLocal = require('../DBconfig/dbms.json')
let DatabaseSettingsRemote = require('../DBconfig/dbmsrds.json')

module.exports = class Database {

    constructor(isLocal = false) {
        this.currentSettings = (isLocal) ? DatabaseSettingsRemote : DatabaseSettingsRemote;
        this.pool = Mysql.createPool({
            host: this.currentSettings.Host,
            user: this.currentSettings.User,
            password: this.currentSettings.Password,
            database: this.currentSettings.Database,
        });
    }

    Connect(callback) {
        let pool = this.pool;
        pool.getConnection((error, connection) => {
            if (error) throw error;
            //    console.log('connected as id ' + connection.threadId);
            callback(connection);
        });
    }

    AllProducts(callback) {
        this.Connect(connection => {
            let query = "SELECT * FROM all_products";
            connection.query(query, (error, results) => {
                connection.release();
                if (error) throw error;
                callback(results);
            });
        });
    }

    SingleProducts(ID, callback) {
        this.Connect(connection => {
            let query = "SELECT * FROM all_products WHERE id = ?";

            connection.query(query, [ID], (error, results) => {
                connection.release();
                if (error) throw error;
                callback(results);
            });
        });
    }

    CategoryProducts(CatId, callback) {
        this.Connect(connection => {
            let query = "SELECT * FROM all_products WHERE categoryid = ?";

            connection.query(query, [CatId], (error, results) => {
                connection.release();
                if (error) throw error;
                callback(results);
            });
        });
    }

    WriteOrder(Order_ID, email, cost, brand) {
        this.Connect(connection => {
            let query = "INSERT INTO brand (ord_id, email, cost, brand) VALUES (?,?,?,?)";

            connection.query(query, [Order_ID, email, cost, brand], (error, results) => {
                connection.release();
                if (error) throw error;
            });
        });
    }

    ReadOrder(Order_ID, callback) {
      //  console.log("Order_ID DB : " + Order_ID);
        this.Connect(connection => {
            let query = "SELECT * FROM brand WHERE ord_id = ?";

            connection.query(query, [Order_ID], (error, results) => {
                connection.release();
                if (error) throw error;
                callback(results);
            });
        });
    }

    ConfirmOrderID(Order_ID, callback) {
        this.Connect(connection => {
            let query = "SELECT * FROM brand WHERE ord_id = ?";

            connection.query(query, [Order_ID], (error, results) => {
                if (error) throw error;

                if (results[0] != undefined && results[0].paymentsucessful == 0) {
                    let query = "INSERT INTO brand (paymentsucessful) VALUES (?)";
                    connection.query(query, [1], (error) => {
                        connection.release();
                        if (error) throw error;
                    });

                    callback({
                        valid: true,
                        reason: "Success.",
                    });
                } else {
                    connection.release();
                    callback({
                        valid: false,
                        reason: "ID does not exists."
                    });
                }
            });
        });
    }
}
