const jsonFile = require('../utilities/data.json');

module.exports = class PriceCalculation {
    constructor(name) {
        this.name = name;
        this.price ='';
    }

    PriceCal(ID) {
    //    console.log(" Brand ... " + ID);
        jsonFile.table.forEach(card => {
            if (card.Id == ID) {
    //            console.log("Card ID ... " + card.Company);
                this.price = card.Price;         
                this.name = card.Company;      
            }
        });
        return [this.price, this.name];
    }
}