
const { query } = require('./src/lib/db');
async function test() {
    try {
        const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name='logins'");
        console.log(res.rows.map(r => r.column_name));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
