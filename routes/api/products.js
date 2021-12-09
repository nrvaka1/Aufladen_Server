const express = require('express');
const router = express.Router();
const Database = require('../../DBconfig/Database');
let database = new Database(false);

// All products  http://localhost:4200/api/products/
router.get('/', (req, res) => {
    //  console.log("All Products");
    database.AllProducts(results => { // data.username        
        res.json(results);
    });
});

// Get Single Member http://localhost:4200/api/products/1
router.get('/:id', (req, res) => {
    //console.log("Sigle Player");
    //  console.log(" Sigle Player: " + req.params.id);
    database.SingleProducts(req.params.id, results => { // data.username       
        res.json(results);
    });
});

// Get All catogery http://localhost:4200/api/products/category/1
router.get('/category/:CatId', (req, res) => {
    //    console.log("Category ");
    console.log(" Product ID: " + req.params.CatId);
    database.CategoryProducts(req.params.CatId, results => { // data.username       
        res.json(results);
    });
});

router.get('/orderdetails', (req, res) => {
    console.log("orderdetails ");
    console.log(" Product ID: " + req.params.CatId);
});

module.exports = router;