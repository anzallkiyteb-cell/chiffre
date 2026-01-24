const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/chiffre",
});
async function test() {
    const res = await pool.query("SELECT * FROM chiffres WHERE date = '2026-01-23'");
    console.log("Rows found:", res.rows.length);
    if (res.rows.length > 0) {
        console.log("Fields in row 0:", Object.keys(res.rows[0]));
        console.log("recette_de_caisse value:", res.rows[0].recette_de_caisse);
        console.log("recette_de_caisse type:", typeof res.rows[0].recette_de_caisse);
    }
    process.exit(0);
}
test();
