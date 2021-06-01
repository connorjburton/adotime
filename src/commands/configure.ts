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
    const configInstance: Config = new Config(path.join(this.config.configDir, 'config.json'))
    if (!await configInstance.exists()) {
      await configInstance.create()
    }

    const answers: inquirer.Answers = await inquirer.prompt([
      {
        name: 'url',
        message: 'What is your ADO URL?',
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
        default: await configInstance.get('completed')  || 'Microsoft.VSTS.Scheduling.CompletedWork',
      },
    ])

    await configInstance.set(answers)
  }
}
