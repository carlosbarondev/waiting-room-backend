const path = require('path');
const fs = require('fs');

const Order = require('./order');

class orderControl {

    constructor() {
        this.last = 0;
        this.today = new Date().getDate();
        this.pending = [];
        this.last6 = [];

        this.init();
    }

    get toJson() {
        return {
            last: this.last,
            today: this.today,
            pending: this.pending,
            last6: this.last6
        }
    }

    init() {
        const { last, today, pending, last6 } = require('../db/data.json');
        if (today === this.today) { // El día del archivo data coincide con el día de hoy
            this.pending = pending;
            this.last = last;
            this.last6 = last6;
        } else { // El día del archivo data NO coincide con el día de hoy (es otro día)
            this.saveDB(); // Resetea el archivo data
        }
    }

    saveDB() {
        const dbPath = path.join(__dirname, '../db/data.json');
        fs.writeFileSync(dbPath, JSON.stringify(this.toJson));
    }

    next() {
        this.last += 1;
        const order = new Order(this.last, null, "Waiting");
        this.pending.push(order);
        this.saveDB();
        return order.number;
    }

    attendOrder(table) {
        if (this.pending.length === 0) {
            return null;
        } else {
            const orderByTable = this.pending.find(order => order.table === table);
            if (orderByTable) {
                return orderByTable;
            } else {
                const orderByState = this.pending.find(order => order.state === "Waiting");
                if (orderByState) {
                    orderByState.table = table;
                    orderByState.state = "";
                    this.saveDB();
                    return orderByState;
                } else {
                    return null;
                }
            }
        }
    }

    readyOrder(number) {
        if (number === "Ninguno") {
            return null;
        } else {
            const order = this.pending.find(order => order.number === number);
            this.pending = this.pending.filter(order => order.number !== number);
            this.last6.unshift(order);
            if (this.last6.length > 6) {
                this.last6.splice(-1, 1);
            }
            this.saveDB();
            return order;
        }
    }

}

module.exports = orderControl;