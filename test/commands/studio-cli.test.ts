import {expect, test} from '@oclif/test'

describe('studio-cli', () => {
  test
  .stdout()
  .command(['studio-cli'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['studio-cli', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
