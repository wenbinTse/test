"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const config_1 = require("./shared/config");
const app = require('./app');
const PORT = process.env.PORT || config_1.default.port;
app.set('port', PORT);
const server = http.createServer(app);
server.listen(PORT);
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        console.error('unhandled error on server');
        throw error;
    }
    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            console.error('unhandled listen error on server');
            throw error;
    }
});
server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
});
process.on('SIGINT', function () {
    server.close();
});
//# sourceMappingURL=server.js.map