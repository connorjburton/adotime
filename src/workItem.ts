import {Got, Response} from 'got'

export type JsonPatch = {
    op: 'replace';
    path: string;
    value: string | number;
}

type Params = {
  fields: string;
}

export default class WorkItem {
    private id: string;

    private request: Got;

    constructor(id: string, request: Got) {
      this.id = id
      this.request = request
    }

    private get url(): string {
      return `wit/workitems/${this.id}`
    }

    public async get(params: Params): Promise<any> {
      const result: Response = await this.request.get(this.url, {searchParams: params, responseType: 'json'})

      return result.body
    }

    public async update(ops: JsonPatch[]) {
      await this.request.patch(
        this.url,
        {
          json: ops,
          headers: {
            'Content-Type': 'application/json-patch+json',
          },
        }
      )
    }
}
