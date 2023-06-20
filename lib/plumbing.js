import inject from 'seacreature/lib/inject'

const ctx = { }
for (const c of inject.many('ctx')) Object.assign(ctx, await c(ctx))
for (const p of inject.many('pod')) {
  console.log('test', p)
  Object.assign(ctx, await p(ctx))
  console.log('test2')
}
await ctx.hub.emit('ready')