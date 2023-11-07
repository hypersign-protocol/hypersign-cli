import {Args, Command, Flags} from '@oclif/core'

export default class StudioCli extends Command {
  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
  }

  static args = {
    setup: Args.string({
      name: 'setup',
      description: 'Setup configuration for this issuer node'}),
    start: Args.string({
      name: 'start', 
      description: 'Start this issuer node'
    })
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(StudioCli)

    const name = flags.name ?? 'world'
    this.log(`hello ${name} from /Users/hermit/code/hm/hs/studio-cli/src/commands/studio-cli.ts`)
    // if (args.setup && flags.force) {
    //   this.log(`you input --force and --file: ${args.setup}`)
    // }
  }
}
