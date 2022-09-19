const path = require('node:path');
const Koa = require('koa');
const koaStatic = require('koa-static');

function main() {
    const port = 8000;
    const server = new Koa();
    server.use(koaStatic(path.resolve(__dirname, '../web')));
    server.listen(port, () => {
        console.log(`Listening on ${port}`);
    });
}
main();
