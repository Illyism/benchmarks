import { Req, Res } from "../handler/handle"

export default function verifyTLC(req: Req, res: Res) {
    // router
    if (req.method === 'POST') {
        if (req.path.includes('webhook')) {
            return true
        }

        if (req.headers['x-tlc'] != '1') {
            res.send('Forbidden tlc', null, 403)
            return false
        }
    }
    return true
}
