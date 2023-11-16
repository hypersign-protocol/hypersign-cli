import fs from 'fs'
import { homedir } from 'os'
import path from 'path'
export class DataDirManager {
    static readonly WORKDIR = `${homedir}/.studio-cli`
    static readonly DOCKERCOMPOSE_FILE_PATH =  path.join(DataDirManager.WORKDIR, 'docker-compose.yml')
    private static readonly STUDIODIR = `${DataDirManager.WORKDIR}/studio-frontend` 
    private static readonly NGINXDIR = `${DataDirManager.WORKDIR}/nginx` 

    static async init(){
        if(!fs.existsSync(DataDirManager.WORKDIR)) fs.mkdirSync(DataDirManager.WORKDIR);

        if(!fs.existsSync(DataDirManager.NGINXDIR)) fs.mkdirSync(DataDirManager.NGINXDIR);
        
        let oldfilePath = path.join(__dirname, 'commands/nginx/nginx.conf')
        let newfilePath = `${DataDirManager.NGINXDIR}/nginx.conf`

        DataDirManager.fileMove(oldfilePath, newfilePath)
        
        if(!fs.existsSync(DataDirManager.STUDIODIR)) fs.mkdirSync(DataDirManager.STUDIODIR);
        
        oldfilePath = path.join(__dirname, 'commands/studio-frontend/nginx.conf');
        newfilePath = `${DataDirManager.STUDIODIR}/nginx.conf`
        DataDirManager.fileMove(oldfilePath, newfilePath)

        oldfilePath = path.join(__dirname,'commands/studio-frontend/Dockerfile');
        newfilePath = `${DataDirManager.STUDIODIR}/Dockerfile`
        DataDirManager.fileMove(oldfilePath, newfilePath)
    }

    static checkIfDataDirInitated(): { status: boolean, messages: string[] } {
        const errors = [];
        if(!fs.existsSync(DataDirManager.WORKDIR)){
            errors.push('WORKDIR does not exist');
        }

        if(!fs.existsSync(DataDirManager.DOCKERCOMPOSE_FILE_PATH)){
            errors.push('Configuration is not set');
        }

        if(errors.length > 0){
            return {
                status: false,
                messages: errors
            }
        } else {
            return {
                status: true,
                messages: []
            }
        }
    }

    static cleanWorkDir(): void {
        fs.rmSync(DataDirManager.WORKDIR, { recursive: true, force: true });
    }

    static fileMove(oldfilePath: string, newfilePath: string){
        fs.renameSync(oldfilePath, newfilePath)
    }
      
}


