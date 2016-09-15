module.exports = function(io, log) {
    var chatClients = {};
    var chatClientsOnline = {};

    io.sockets.on('connection', function (socket) {
        socket.on('userRegister', function (data) {
            userRegister(socket, data);
        });

        socket.on('newMessage', function (data) {
            newMessage(socket, data);
        });

        socket.on('online', function (data) {
            online(socket, data);
        });

        socket.on('offline', function (data) {
            offline(socket, data);
        });

        socket.on('disconnect', function (data) {
            disconnect(socket, data);
        });
    });

    function userRegister(socket, data) {
        log.step(1, 0);

        chatClients[socket.id] = data.userName;

        socket.username = data.userName;

        io.sockets.emit('updateChatList', chatClients);

        online(socket);
    }

    function newMessage(socket, data) {
        socket.broadcast.emit('newMessage', {
            userName: socket.username,
            message: data.message
        });
    }

    function disconnect(socket, data) {
        log.step(-1, -1);

        setTimeout(function () {
            delete chatClients[socket.id];
            delete chatClientsOnline[socket.id];

            io.sockets.emit('updateChatList', chatClients);
            io.sockets.emit('usersStatus', chatClientsOnline);
        }, 500);
    }

    function online(socket, data) {
        log.step(0, 1);

        chatClientsOnline[socket.id] = socket.username;

        socket.status = 'online';

        io.sockets.emit('usersStatus', chatClientsOnline);
    }

    function offline(socket, data) {
        log.step(0, -1);

        delete chatClientsOnline[socket.id];

        socket.status = 'offline';

        io.sockets.emit('usersStatus', chatClientsOnline);
    }

    log.start('Пользователей онлайн %s, Активных %s.');
};