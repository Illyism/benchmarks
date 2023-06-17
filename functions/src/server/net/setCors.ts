import { Req, Res } from "../handler/handle"

export default function setCors(req: Req, res: Res) {
    const origin = req.headers.origin

    const responseHeaders = {
        "Access-Control-Allow-Origin": origin || "*",
        'Access-Control-Allow-Credentials': 'true',
    }

    const method = req.method
    if (method === 'OPTIONS') {
        responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-PROJECT, X-Requested-With, X-TLC'
        responseHeaders['Access-Control-Max-Age'] = '3600'
        res.send(null, responseHeaders)
        return true
    }

    res.headers = responseHeaders
    return false
}
