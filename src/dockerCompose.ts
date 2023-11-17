// const execa = require('execa')
// import { execa } from "execa";

export class DockerCompose {
  static async isDeamonRunning(serviceName: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");

    return execa('docker', [
      'stats',
      '--no-stream'
    ])
  }

  static async pull(serviceName: string, dockerComposeFilePath: string,): Promise<any>{
    const { execa } = await import("execa");
    return execa('docker-compose', [
      '-f',
      dockerComposeFilePath,
      'pull',
      serviceName,
    ])
  }
  
  static async build(serviceName: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
      return execa('docker-compose', [
          '-f',
          dockerComposeFilePath,
          'build',
          serviceName,
      ])
  }

  static async up( serviceName: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
      return execa('docker-compose', [
          '-f',
          dockerComposeFilePath,
          'up',
          '-d',
          serviceName,
      ])
  }

  static async down(serviceName: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
      return execa('docker-compose', [
        '-f',
        dockerComposeFilePath,
        'down'
      ])
  }

  static async rmi(service: string, dockerComposeFilePath: string): Promise<any>{
    const { execa } = await import("execa");
    return execa('docker', [
      'rmi',
      '-f',
      service
    ])
  }
  

}