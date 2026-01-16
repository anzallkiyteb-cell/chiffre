const { Pool } = require('pg');
require('dotenv').config();

async function check() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'chiffres' AND column_name IN ('date', 'recette_net', 'total_diponce', 'diponce', 'diponce_divers', 'diponce_journalier', 'diponce_admin')");
        console.log('Chiffres column types:', res.rows);

        const sample = await pool.query("SELECT recette_net, total_diponce FROM chiffres WHERE recette_net IS NOT NULL LIMIT 1");
        console.log('Sample data:', sample.rows[0]);

        const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'date'");
        console.log('Invoices date type:', res2.rows[0]);

        const count = await pool.query("SELECT COUNT(*) FROM chiffres WHERE date::text LIKE '2026-01-%'");
        console.log('Chiffres count with LIKE:', count.rows[0]);

        const count2 = await pool.query("SELECT COUNT(*) FROM invoices WHERE date LIKE '2026-01-%'");
        console.log('Invoices count with LIKE:', count2.rows[0]);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
