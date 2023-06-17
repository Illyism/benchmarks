import type http2 from 'http2';
import type http from 'http';

export default async function parseBody(request: http2.Http2ServerRequest | http.IncomingMessage) {
    // parse body
    if (request.headers['content-type'] === 'application/json') {
        // read body
        const buffers: Buffer[] = [];
        for await (const chunk of request) {
            buffers.push(chunk);
        }
        const data = Buffer.concat(buffers).toString();
        if (!data) return {}

        try {
            return JSON.parse(data)
        } catch(e) { /* */ }
    }

    return {}
}