import {promises as fs, constants as fsConstants} from 'fs'

export type ConfigMap = {
    [key: string]: string;
}

export default class Config {
    private location: string;

    constructor(location: string) {
      this.location = location
    }

    async exists(): Promise<boolean> {
      try {
        await fs.access(this.location, fsConstants.W_OK)
        return true
      } catch {
        return false
      }
    }

    async create(): Promise<void> {
      await fs.writeFile(this.location, '{}')
    }

    async read(): Promise<ConfigMap> {
      return JSON.parse(await fs.readFile(this.location, {encoding: 'utf8'}))
    }

    async write(contents: ConfigMap): Promise<void> {
      return fs.writeFile(this.location, JSON.stringify(contents))
    }

    async get(property: string): Promise<string|undefined> {
      const state = await this.read()
      if (!(property in state)) {
        return
      }

      return state[property]
    }

    async set(map: ConfigMap): Promise<void> {
      const state = await this.read()
      for (const key in map) {
        if (key in map) {
          state[key] = map[key]
        }
      }
      return this.write(state)
    }
}
