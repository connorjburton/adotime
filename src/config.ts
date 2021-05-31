import path from 'path';
import { readFile, writeFile } from 'fs/promises';

export type ConfigFile = {
    [key: string]: string
}

export default class Config {
    private location: string = path.resolve('./../', 'config.json');

    async read(): Promise<ConfigFile> {
        return JSON.parse(await readFile(this.location, { encoding: 'utf8' }));
    }

    async write(contents: ConfigFile): Promise<void> {
        return await writeFile(this.location, JSON.stringify(contents));
    }

    async get(property: string): Promise<string> {
        const state = await this.read();
        if (!(property in state)) {
            throw new Error(`Config does not contain ${property}`);
        }

        return state[property];
    }

    async set(property: string, value: string): Promise<void> {
        const state = await this.read();
        state[property] = value;
        return await this.write(state);
    }
}