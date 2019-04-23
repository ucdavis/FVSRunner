import knex from 'knex';
import sqlite3 from 'sqlite3';
import { biomass_output_model } from './models/biomass_output_model';
import { fvs_output_model } from './models/fvs_output_model';

export { updateFromOutputDb };

const updateFromOutputDb = async (standID: string, fileName: string, db: knex) => {
  const sqliteOutput = await getOutputFromSqlite(fileName, db);
  try {
    await db.table('biomass_output').insert(sqliteOutput);
  } catch (error) {
    console.log(error);
  }
};

// from https://stackoverflow.com/questions/46994203/sqlite3-promise-for-asynchronous-calls
const getOutputFromSqlite = async (fileName: string, db: knex) => {
  return new Promise((resolve, reject) => {
    const sqliteDb = new sqlite3.Database(`${fileName}-Out.db`);
    const sqliteOutput: biomass_output_model[] = [];
    const out = sqliteDb.each(
      `SELECT * FROM FVS_Summary`,
      (err, row: fvs_output_model) => {
        if (err) {
          reject(err);
        } else {
          sqliteOutput.push({
            stand_id: row.StandID,
            year: row.Year,
            ba: row.BA
          });
        }
      },
      (err, n) => {
        if (err) {
          reject(err);
        } else {
          resolve(sqliteOutput);
        }
      }
    );
    sqliteDb.close();
  });
};
