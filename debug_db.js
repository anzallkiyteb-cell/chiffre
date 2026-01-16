const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debug() {
    try {
        const res = await pool.query('SELECT count(*) FROM chiffres');
        console.log('Chiffres count:', res.rows[0].count);

        const res2 = await pool.query('SELECT count(*) FROM invoices');
        console.log('Invoices count:', res2.rows[0].count);

        const res3 = await pool.query("SELECT date, recette_de_caisse, recette_net, total_diponce FROM chiffres WHERE date LIKE '2026-01-%' LIMIT 5");
        console.log('Jan 2026 Chiffres sample:', res3.rows);

        const normalizeDate = (d) => {
            if (!d) return null;
            try {
                const dateObj = new Date(d);
                if (isNaN(dateObj.getTime())) return null;
                const y = dateObj.getFullYear();
                const mn = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dy = String(dateObj.getDate()).padStart(2, '0');
                return `${y}-${mn}-${dy}`;
            } catch (e) { return null; }
        };

        const res4 = await pool.query("SELECT * FROM invoices WHERE status = 'paid' AND paid_date LIKE '2026-01-%' LIMIT 5");
        console.log('Jan 2026 Paid Invoices sample:', res4.rows);
        res4.rows.forEach(r => {
            console.log(`Original: ${r.paid_date}, Normalized: ${normalizeDate(r.paid_date)}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

debug();
