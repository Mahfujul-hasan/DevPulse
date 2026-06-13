import { neon } from '@neondatabase/serverless';
import config from '../config';
import { createSchema } from './schema';

export const sql = neon(`${config.db_url}`);

const initDB = async () => {
    try {
        await createSchema();
        console.log("database is connected successfully!!");
    } catch (error) {
        console.error("Database connection failed!!", error);
        process.exit(1);
    }
}

export default initDB;