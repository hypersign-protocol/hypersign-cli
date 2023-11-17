import {Command} from '@oclif/core'
import {DockerCompose } from '../dockerCompose'
import * as Messages from '../messages'
const Listr = require('listr')
import { DataDirManager } from '../dataDirManager'
import { DependancyCheck } from '../dependencyCheck'

const dockerComposeFilePath = DataDirManager.DOCKERCOMPOSE_FILE_PATH
type Task = {title: string; task: Function}

export default class Stop extends Command {
  static description = Messages.LOG.STOP_DESCRIPTION
  static examples = ['<%= config.bin %> <%= command.id %>']
  
  getTask(taskTitle: string, task: Function, flag?: any): Task {
    return {
      title: taskTitle,
      task: async () => await task(flag, dockerComposeFilePath),
    }
  }


  public async run(): Promise<void> {
    if(!DataDirManager.checkIfDataDirInitated().status){
      throw new Error(Messages.ERRORS.NO_CONFIG_FOUND)
    }
    
    let allTasks;

    const checkingProcessesTasks = new Listr([
      this.getTask(Messages.TASKS.IF_DOCKER_INSTALLED, DependancyCheck.ifProcessInstalled, 'docker'),
      this.getTask(Messages.TASKS.IF_DOCKER_COMPOSE_INSTALLED, DependancyCheck.ifProcessInstalled, 'docker-compose'),
      this.getTask(Messages.TASKS.IF_DOCKER_DEAMON_RUNNING, DockerCompose.isDeamonRunning)
    ])

    // Shutdown running containers
    const containerDownTasks = new Listr([
      this.getTask(`Shutdown`, DockerCompose.down, 'stop')
    ])

    allTasks = new Listr([
      this.getTask(Messages.TASKS.IF_ALL_DEPENDENCIES_INSTALLED , () => { return checkingProcessesTasks} ),
      this.getTask(Messages.TASKS.SHUTTING_DOWN_CONTAINERS, () => { return containerDownTasks  }),
    ],  {concurrent: false},);

    
    
    allTasks.run()
    .then(() => {
        this.log(Messages.LOG.ALL_CONTAINERS_STOPPED)
    })
    .catch((err: any) => {
      console.error(err)
    })
  }
}
