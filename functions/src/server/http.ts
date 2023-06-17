import http from 'http';
import http2 from 'http2';
import registerShutdown from './net/shutdown.js';
import {handleRequest} from './handler/handle.js'

async function getServer(onRequestHandler?: (request: http2.Http2ServerRequest | http.IncomingMessage, response: http2.Http2ServerResponse | http.ServerResponse) => void) {
    return http.createServer(onRequestHandler)
}

/**
 * Creates a HTTP/2 server and listens to requests
 * delegating to the "index.ts" file for the actual logic
 */
export async function startHTTP() {
    const server = await getServer(handleRequest)

    server.listen(process.env.PORT || 3000, () => {
        registerShutdown(() => {
            server.close();
            process.exit();
        });
    });

    server.on('error', handleError);

    process.on('uncaughtException', handleError)
    process.on('unhandledRejection', handleError)
}

function handleError(err: Error) {
    console.error(err.message, err.stack);
    process.exit(1);
}