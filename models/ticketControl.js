const path = require('path');
const fs = require('fs');

const Ticket = require('./ticket');

class ticketControl {

    constructor() {
        this.last = 0;
        this.today = new Date().getDate();
        this.pending = [];
        this.last4 = [];

        this.init();
    }

    get toJson() {
        return {
            last: this.last,
            today: this.today,
            pending: this.pending,
            last4: this.last4
        }
    }

    init() {
        const { last, today, pending, last4 } = require('../db/data.json');
        if (today === this.today) { // El día del archivo data coincide con el día de hoy
            this.pending = pending;
            this.last = last;
            this.last4 = last4;
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
        const ticket = new Ticket(this.last, null);
        this.pending.push(ticket);
        this.saveDB();
        return 'Ticket ' + ticket.number;
    }

    attendTicket(desktop) {
        if (this.pending.length === 0) {
            return null;
        } else {
            const ticket = this.pending.shift(); // Saco el primer ticket de la lista de pendientes
            ticket.desktop = desktop;
            this.last4.unshift(ticket);
            if (this.last4.length > 4) {
                this.last4.splice(-1, 1);
            }
            this.saveDB();
            return ticket;
        }
    }

}

module.exports = ticketControl;