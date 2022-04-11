// Referencias HTML
const lblDesktop = document.querySelector('h1');
const btnAttend = document.querySelector('button');
const lblTicket = document.querySelector('small');
const divAlert = document.querySelector('.alert');
const lblPendientes = document.querySelector('#lblPendientes');

const searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has('escritorio')) {
    window.location = 'index.html';
    throw new Error('El escritorio es obligatorio');
}

const desktop = searchParams.get('escritorio');
lblDesktop.innerText = desktop;
divAlert.style.display = "none";

const socket = io();

socket.on('connect', () => {
    btnAttend.disabled = false;
});

socket.on('disconnect', () => {
    btnAttend.disabled = true;
});

socket.on('pending-tickets', (pending) => {
    if (pending === 0) {
        lblPendientes.style.display = "none";
        divAlert.style.display = "";

    } else {
        lblPendientes.style.display = "";
        lblPendientes.innerText = pending;
        divAlert.style.display = "none";
    }
});

btnAttend.addEventListener('click', () => {

    socket.emit('attend-ticket', { desktop }, (payload) => {

        if (!payload.ok) {
            lblTicket.innerText = "Nadie.";
            return divAlert.style.display = "";
        }

        lblTicket.innerText = 'Ticket ' + payload.ticket.number;
    });
    /*socket.emit('next-ticket', null, (ticket) => {
        lblNuevoTicket.innerText = ticket;
    });*/
});