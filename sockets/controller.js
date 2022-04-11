const TicketControl = require("../models/ticketControl");

const ticketControl = new TicketControl();

const socketController = (socket) => {

    // Cuando un cliente se conecta
    socket.emit('last-ticket', ticketControl.last);
    socket.emit('current-status', ticketControl.last4);
    socket.emit('pending-tickets', ticketControl.pending.length);

    socket.on('next-ticket', (payload, callback) => {
        const next = ticketControl.next();
        callback(next);
        socket.broadcast.emit('pending-tickets', ticketControl.pending.length);
    });

    socket.on('attend-ticket', (payload, callback) => {

        if (!payload.desktop) {
            return callback({
                ok: false,
                msg: 'El escritorio es obligatorio'
            })
        }

        const ticket = ticketControl.attendTicket(payload.desktop);

        socket.broadcast.emit('current-status', ticketControl.last4);
        socket.emit('pending-tickets', ticketControl.pending.length);
        socket.broadcast.emit('pending-tickets', ticketControl.pending.length);

        if (!ticket) {
            callback({
                ok: false,
                msg: 'No hay tickets pendientes'
            });
        } else {
            callback({
                ok: true,
                ticket
            });
        }

    });

}

module.exports = {
    socketController
}