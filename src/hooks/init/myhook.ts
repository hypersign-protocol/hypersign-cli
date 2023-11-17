import {Hook} from '@oclif/core'
import { DataDirManager } from '../../dataDirManager'

const hook: Hook<'init'> = async function (opts) {
  if(opts.id && opts.id === 'setup') {
    await DataDirManager.init()
  }
}

export default hook
