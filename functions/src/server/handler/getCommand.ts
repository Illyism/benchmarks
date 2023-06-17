import path from 'path';
import { Req, Res } from './handle.js';

const commandMap = new Map<string, null | ((req: Req, res: Res) => Promise<any>)>();

const warmupCommand = async (commandName: string) => {
    if (commandMap.has(commandName)) {
        return;
    }

    if (!commandName.match(/^[a-zA-Z0-9/]+$/)) {
        if (commandName !== '/favicon.ico') {
            console.error('Invalid command name', commandName);
        }
        commandMap.set(commandName, null);
        return
    }

    const commandPath = path.join(__dirname, '../../controllers', 'index.js');
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command = require(commandPath).default;
        if (typeof command !== 'function') {
            console.error('Invalid command', commandPath);
            commandMap.set(commandName, null);
        }
        commandMap.set(commandName, command);
        return
    } catch (e) {
        console.error('Error loading command', commandPath);
        commandMap.set(commandName, null);
    }
};

export const getCommand = async (commandName: string): Promise<(req: Req, res: Res) => Promise<any> | undefined> => {
    await warmupCommand(commandName)
    return commandMap.get(commandName);
};