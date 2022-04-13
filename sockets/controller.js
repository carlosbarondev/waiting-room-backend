const OrderControl = require("../models/orderControl");

const orderControl = new OrderControl();

const socketController = (socket) => {

    // Cuando un cliente se conecta
    socket.emit('last-order', orderControl.last);
    socket.emit('current-status', orderControl.last4);
    socket.emit('pending-orders', orderControl.pending);

    socket.on('next-order', (payload, callback) => {
        const next = orderControl.next();
        callback(next);
        socket.broadcast.emit('pending-orders', orderControl.pending);
    });

    socket.on('attend-order', (payload, callback) => {

        if (!payload.table) {
            return callback({
                ok: false,
                msg: 'El escritorio es obligatorio'
            })
        }

        const order = orderControl.attendOrder(payload.table);

        socket.emit('pending-orders', orderControl.pending);
        socket.broadcast.emit('pending-orders', orderControl.pending);
        console.log(order)
        if (!order) {
            callback({
                ok: false,
                msg: 'No hay pedidos pendientes'
            });
        } else {
            callback({
                ok: true,
                order
            });
        }

    });

    socket.on('ready-order', (payload, callback) => {

        if (!payload.order) {
            return callback({
                ok: false,
                msg: 'El número es obligatorio'
            })
        }

        const order = orderControl.readyOrder(payload.order);

        if (!order) {
            callback({
                ok: false,
                msg: 'Error en la base de datos'
            });
        }

        socket.broadcast.emit('current-status', orderControl.last4);
        socket.emit('pending-orders', orderControl.pending);
        socket.broadcast.emit('pending-orders', orderControl.pending);

    });

}

module.exports = {
    socketController
}