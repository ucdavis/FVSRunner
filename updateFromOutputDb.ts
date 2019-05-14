import knex from 'knex';
import { fvs_output_model } from './models/fvs_output_model';

export { updateFromOutputDb };

const updateFromOutputDb = async (
  standID: string,
  fileName: string,
  db: knex
) => {
  const sqliteOutput = await getOutput(fileName);
  try {
    await db.table('fvs_output').insert(sqliteOutput);
  } catch (error) {
    console.log(error);
  }
};

const getOutput = async (fileName: string) => {
  const sql = knex({
    client: 'sqlite3',
    connection: {
      filename: `./${fileName}-Out.db`
    },
    useNullAsDefault: true
  });

  let sqliteOutput: fvs_output_model[] = [];

  try {
    sqliteOutput = await sql.select().from('FVS_Summary');
  } catch (err) {
    throw err;
  } finally {
    await sql.destroy();
  }

  return sqliteOutput;
};
