const execa = require('execa')
export class DockerCompose {
    static pull(serviceName: string, dockerComposeFilePath: string,){
      return execa('docker-compose', [
        '-f',
        dockerComposeFilePath,
        'pull',
        serviceName,
      ])
    }
    
    static build(serviceName: string, dockerComposeFilePath: string){
        return execa('docker-compose', [
            '-f',
            dockerComposeFilePath,
            'build',
            serviceName,
        ])
    }

    static up( serviceName: string, dockerComposeFilePath: string){
        return execa('docker-compose', [
            '-f',
            dockerComposeFilePath,
            'up',
            '-d',
            serviceName,
        ])
    }

    static down(serviceName: string, dockerComposeFilePath: string){
        return execa('docker-compose', [
          '-f',
          dockerComposeFilePath,
          'down'
        ])
    }

    static rmi(service: string, dockerComposeFilePath: string){
      return execa('docker', [
        'rmi',
        '-f',
        service
      ])
    }
  

}