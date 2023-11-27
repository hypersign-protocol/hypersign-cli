import fs from 'fs'
import { homedir } from 'os'
import path from 'path'
import * as Message from './messages'
export class DataDirManager {
    static readonly WORKDIR = `${homedir}/${Message.SERVICES_NAMES.WORKDIRNAME}`
    static readonly DOCKERCOMPOSE_FILE_PATH =  path.join(DataDirManager.WORKDIR, 'docker-compose.yml')
    private static readonly DEV_DASHBOARD_DIR = `${DataDirManager.WORKDIR}/entity-developer-dashboard` 
    private static readonly NGINXDIR = `${DataDirManager.WORKDIR}/nginx` 
    private static readonly STUDIO_DASHBOARD_DIR = `${DataDirManager.WORKDIR}/entity-studio-dashboard` 

    static async init(){
        if(!fs.existsSync(DataDirManager.WORKDIR)) fs.mkdirSync(DataDirManager.WORKDIR);

        // API-service
        if(!fs.existsSync(DataDirManager.NGINXDIR)) fs.mkdirSync(DataDirManager.NGINXDIR);
        
        let oldfilePath = path.join(__dirname, 'commands/nginx/nginx.conf')
        let newfilePath = `${DataDirManager.NGINXDIR}/nginx.conf`

        DataDirManager.fileCopy(oldfilePath, newfilePath)
        
        // entity-developer-dashboard
        if(!fs.existsSync(DataDirManager.DEV_DASHBOARD_DIR)) fs.mkdirSync(DataDirManager.DEV_DASHBOARD_DIR);
        
        oldfilePath = path.join(__dirname, 'commands/entity-developer-dashboard/nginx.conf');
        newfilePath = `${DataDirManager.DEV_DASHBOARD_DIR}/nginx.conf`
        DataDirManager.fileCopy(oldfilePath, newfilePath)

        oldfilePath = path.join(__dirname,'commands/entity-developer-dashboard/Dockerfile');
        newfilePath = `${DataDirManager.DEV_DASHBOARD_DIR}/Dockerfile`
        DataDirManager.fileCopy(oldfilePath, newfilePath)


        // entity-studio-dashboard
        if(!fs.existsSync(DataDirManager.STUDIO_DASHBOARD_DIR)) fs.mkdirSync(DataDirManager.STUDIO_DASHBOARD_DIR);
        
        oldfilePath = path.join(__dirname, 'commands/entity-studio-dashboard/nginx.conf');
        newfilePath = `${DataDirManager.STUDIO_DASHBOARD_DIR}/nginx.conf`
        DataDirManager.fileCopy(oldfilePath, newfilePath)

        oldfilePath = path.join(__dirname,'commands/entity-studio-dashboard/Dockerfile');
        newfilePath = `${DataDirManager.STUDIO_DASHBOARD_DIR}/Dockerfile`
        DataDirManager.fileCopy(oldfilePath, newfilePath)
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

    static fileCopy(oldfilePath: string, newfilePath: string){
        fs.copyFileSync(oldfilePath, newfilePath)
    }
      
}


