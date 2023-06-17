import { getCommand } from './getCommand.js';
import { Req, Res } from './handle.js';

export const startCommand = async (req: Req, res: Res) => {
    const command = await getCommand(req.path.split('?')[0]);

    if (!command) {
        res.send('Command not found', null, 404);
        return;
    }

    try {
        const response = await command(req, res);
        res.send(response);
    } catch (e: unknown) {
        handleError(req, res, e);
    }

};

const handleError = (req: Req, res: Res, error: any) => {
    let message = error.message
    
    if (error.response) {
        message = error.response.data?.error?.message ?? error.response.data?.error
    }
    
    console.error('handleError', error)

    res.send({
        status: error?.response?.status ?? 400,
        code: error.code,
        message,
    }, null, error?.response?.status ?? 400)
}