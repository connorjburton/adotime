import inquirer from 'inquirer'
import {Command} from '@oclif/command'
import path from 'path'
import Config from '../config'

export default class Configure extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ adotime-oclif configure
hello world from ./src/configure.ts!
`,
  ]

  async run() {
    const configLocation: string = path.join(this.config.configDir, 'config.json')
    const configInstance: Config = new Config(configLocation)
    if (!await configInstance.exists()) {
      await configInstance.create()
    }

    this.log(`You can manually edit the configuration file at ${configLocation}. Please read the documentation for more details on each option.`)

    const answers: inquirer.Answers = await inquirer.prompt([
      {
        name: 'url',
        message: 'What is your ADO URL (e.g dev.azure.com/org/project)?',
        // replace _apis if exists so we don't double up, and remove any trailing /
        filter: (input: string): string => `${input.replace('/_apis', '').replace(/\/$/, '')}/_apis`,
        default: await configInstance.get('url'),
      },
      {
        name: 'pat',
        message: 'What is your PAT?',
        default: await configInstance.get('pat'),
      },
      {
        name: 'remaining',
        message: 'What is your Remaining Time Field?',
        default: await configInstance.get('remaining') || 'Microsoft.VSTS.Scheduling.RemainingWork',
      },
      {
        name: 'completed',
        message: 'What is your Completed Time Field?',
        default: await configInstance.get('completed') || 'Microsoft.VSTS.Scheduling.CompletedWork',
      },
      {
        name: 'proxy',
        message: '(Optional) What is your proxy URL?',
        default: await configInstance.get('proxy'),
      },
      {
        name: 'ua',
        message: '(Optional) What user agent would you like to use?',
        default: await configInstance.get('ua'),
      },
      {
        name: 'cafile',
        message: '(Optional) What is the path your cafile?',
        default: await configInstance.get('cafile'),
      },
    ])

    await configInstance.set(answers)
  }
}
