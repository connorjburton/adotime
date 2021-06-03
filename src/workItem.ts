import {AxiosInstance, AxiosResponse} from 'axios'

export type JsonPatch = {
    op: 'replace';
    path: string;
    value: string | number;
}

export type GetResponse = {
    fields: {
        [key: string]: number;
    };
}

type Params = {
  fields: string;
}

export default class WorkItem {
    private id: string;

    private request: AxiosInstance;

    constructor(id: string, request: AxiosInstance) {
      this.id = id
      this.request = request
    }

    private get url(): string {
      return `wit/workitems/${this.id}`
    }

    public async get(params: Params): Promise<GetResponse> {
      const result: AxiosResponse = await this.request.get(this.id, {params})

      return result.data
    }

    public async update(ops: JsonPatch[]) {
      await this.request.patch(
        this.url,
        ops,
        {
          headers: {
            'Content-Type': 'application/json-patch+json',
          },
        }
      )
    }
}
