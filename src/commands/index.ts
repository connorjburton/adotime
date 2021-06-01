import inquirer from 'inquirer'
import axios, {AxiosInstance} from 'axios'
import path from 'path'

import WorkItem, {JsonPatch, GetResponse} from './../workItem'
import Config, {ConfigMap} from './../config'

import {Command} from '@oclif/command'

interface Answers extends inquirer.Answers {
    URL: string;
    PAT: string;
}

export default class Index extends Command {
    static description = 'describe the command here'

    static examples = [
      `$ adotime-oclif hello
  hello world from ./src/hello.ts!
  `,
    ]

    hasConfig(config: ConfigMap): boolean {
      const hasMissing: boolean = ['url', 'pat', 'remaining', 'completed'].some((key: string): boolean => !Object.prototype.hasOwnProperty.call(config, key) || config[key].length === 0)
      return !hasMissing
    }

    is24Hr(value: string): boolean | string  {
      const err = 'The value provided is not a 24 hour value'
      if (value.length !== 4) {
        return err
      }

      const parsedVal: number = parseInt(value, 10)
      if (Number.isNaN(parsedVal) || parsedVal < 0 || parsedVal > 2359) {
        return err
      }

      return true
    }

    calcTimeDiff([startHours, startMinutes]: number[], [endHours, endMinutes]: number[]): number {
      const before: Date = new Date()
      before.setHours(startHours)
      before.setMinutes(startMinutes)
      before.setSeconds(0)
      before.setMilliseconds(0)

      const after: Date = new Date(before.getTime())
      after.setHours(endHours)
      after.setMinutes(endMinutes)

      const milliDiff: number = after.getTime() - before.getTime()
      return this.fixedFloat((((milliDiff / 1000) / 60) / 60))
    }

    fixedFloat(num: number, fix = 2): number {
      return parseFloat(num.toFixed(fix))
    }

    toBase64(str: string): string {
      const buff: Buffer = Buffer.from(str, 'utf-8')
      return buff.toString('base64')
    }

    async run() {
      const configInstance: Config = new Config(path.join(this.config.configDir, 'config.json'))
      if (!await configInstance.exists()) {
        this.error('Config does not exist. Please run `adotime configure`')
      }

      if (!this.hasConfig(await configInstance.read())) {
        this.error('Does not have the required config, please run `adotime configure`')
      }

      const answers: inquirer.Answers = await inquirer.prompt([
        {name: 'wi', message: 'WI number?'},
        {name: 'start', message: 'Start time?', validate: this.is24Hr},
        {name: 'end', message: 'End time?', validate: this.is24Hr},
      ])
      const request: AxiosInstance = axios.create({
        baseURL: answers.URL,
        headers: {
          Authorization: `Basic ${this.toBase64(`:${answers.PAT}`)}`,
        },
        params: {
          'api-version': '5.1',
        },
      })

      const wi: WorkItem = new WorkItem(answers.wi, request)

      try {
        const remainingField: string|undefined = await configInstance.get('remaining')
        const completedField: string|undefined = await configInstance.get('completed')
        if (typeof remainingField === 'undefined' || typeof completedField === 'undefined') {
          this.error('Remaining or completed fields not set, please return `adotime configure`')
        }

        const details: GetResponse = await wi.get({fields: `${remainingField},${completedField}`})
        const diff: number = this.calcTimeDiff(
          [parseInt(answers.start.slice(0, 2), 10), parseInt(answers.start.slice(2, 4), 10)],
          [parseInt(answers.end.slice(0, 2), 10), parseInt(answers.end.slice(2, 4), 10)]
        )

        const ops: JsonPatch[] = []
        const remaining: number = details.fields[remainingField]
        if (typeof remaining === 'number' && !Number.isNaN(remaining)) {
          ops.push({
            op: 'replace',
            path: `/fields/${remainingField}`,
            value: Math.max(0, this.fixedFloat(remaining - diff)),
          })
        }

        await wi.update([
          ...ops,
          {
            op: 'replace',
            path: `/fields/${completedField}`,
            value: this.fixedFloat((details.fields[completedField] || 0) + diff),
          },
        ])
      } catch (error) {
        throw error
      }
    }
}
