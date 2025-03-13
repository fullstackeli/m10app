import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();
const { Client } = pg;
const client = new Client({
    host: 'localhost',
    port: 5432,
});
export { client };
