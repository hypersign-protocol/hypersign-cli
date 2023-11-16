import fs from 'fs';

export async function checkIfFileOrDirExists(path: string){
    return fs.existsSync(path)
}


export async function createDir(path: string){
    return fs.mkdirSync(path)
}




