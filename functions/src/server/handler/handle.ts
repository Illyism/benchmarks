import type http from 'http';
import type http2 from 'http2';
import parseBody from '../net/parseBody';

import { promisify } from 'util';
import zlib from 'zlib';
import setCors from '../net/setCors.js';
import verifyTLC from '../net/verifyTLC.js';
import { startCommand } from './commands.js';
const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

export interface Req {
    request: http2.Http2ServerRequest | http.IncomingMessage;
    headers: http2.IncomingHttpHeaders;
    path: string;
    method: string;
    query: URLSearchParams;
    local: any;
    body: any;
}

export interface Post<T> extends Req {
    body: T;
}

async function createRequest(request: http2.Http2ServerRequest | http.IncomingMessage): Promise<Req> {
    return {
        request,
        headers: request.headers,
        path: request.url,
        method: request.method,
        query: new URLSearchParams(request.url.split('?')[1]),
        local: {},
        body: await parseBody(request),
    }
}

export interface Res {
    headers: http2.OutgoingHttpHeaders;
    response: http2.Http2ServerResponse | http.ServerResponse;
    send: (data: any, _headers?: http2.OutgoingHttpHeaders, statusCode?: number) => Promise<void>;
}

function createResponse(request: http2.Http2ServerRequest | http.IncomingMessage, response: http2.Http2ServerResponse | http.ServerResponse): Res {
    const res: Res = {
        headers: {},
        response,
        async send (data: any, _headers = {}, statusCode = 200) {
            if (!_headers) _headers = {}
            if (response.writableEnded) return
            if (!data) {
                response.writeHead(statusCode == 200 ? 204 : statusCode, { ...res.headers, ..._headers })
                response.end()
                return
            }

            response.writeHead(statusCode, { ...res.headers, ..._headers })
            response.end(data)
        }
    }
    return res
}

export async function handleRequest(request: http2.Http2ServerRequest | http.IncomingMessage, response: http2.Http2ServerResponse | http.ServerResponse) {
    try {
        const req = await createRequest(request);
        const res = createResponse(request, response);

        if (setCors(req, res)) return;
        if (!verifyTLC(req, res)) return;

        await startCommand(req, res);
    } catch(e: unknown) {
        handleError(request, response, e);
    }
}

function handleError(request: http2.Http2ServerRequest | http.IncomingMessage, response: http2.Http2ServerResponse | http.ServerResponse, e: unknown) {
    console.error('handle', e);
    response.writeHead(500);
    response.write(e.toString());
}
