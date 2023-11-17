import * as Message from "./messages"
export class DockerCompose {
  static async isDeamonRunning(serviceName: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
    return execa(Message.SERVICES_NAMES.DOCKER, [
      'stats',
      '--no-stream'
    ])
  }

  static async pull(serviceName: string, dockerComposeFilePath: string,): Promise<any>{
    const { execa } = await import("execa");
    const commands = Message.SERVICES_NAMES.DOCKER_COMPOSE.split(" ")
    return execa(commands[0],[
      commands[1],
      '-f',
      dockerComposeFilePath,
      'pull',
      serviceName,
    ])
  }
  
  static async build(serviceName: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
    const commands = Message.SERVICES_NAMES.DOCKER_COMPOSE.split(" ")
      return execa(commands[0], [
        commands[1],
          '-f',
          dockerComposeFilePath,
          'build',
          serviceName,
      ])
  }

  static async up( serviceName: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
    const commands = Message.SERVICES_NAMES.DOCKER_COMPOSE.split(" ")
      return execa(commands[0], [
        commands[1],
          '-f',
          dockerComposeFilePath,
          'up',
          '-d',
          serviceName,
      ])
  }

  static async down(serviceName: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
    const commands = Message.SERVICES_NAMES.DOCKER_COMPOSE.split(" ")
      return execa(commands[0], [
        commands[1],
        '-f',
        dockerComposeFilePath,
        'down'
      ])
  }

  static async rmi(service: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
    return execa(Message.SERVICES_NAMES.DOCKER, [
      'rmi',
      '-f',
      service
    ])
  }
  

}