import knex from 'knex';
import { biomass_output_model } from 'models/biomass_output_model';
import { FVS_Output_Model } from 'models/FVS_Output_Model';
import sqlite3 from 'sqlite3';

export { updateFromOutputDb };

const updateFromOutputDb = async (standID: string, db: knex) => {
  const sqliteOutput = await getOutputFromSqlite(standID, db);
  try {
    await db.table('biomass_output').insert(sqliteOutput);
  } catch (error) {
    console.log(error);
  }
  await db
    .table('fvs_standinit_large')
    .where({ Stand_ID: standID })
    .update('FVS_Run', true);
};

// from https://stackoverflow.com/questions/46994203/sqlite3-promise-for-asynchronous-calls
const getOutputFromSqlite = async (standID: string, db: knex) => {
  return new Promise((resolve, reject) => {
    const sqliteDb = new sqlite3.Database(`${standID}-Out.db`);
    const sqliteOutput: biomass_output_model[] = [];
    const out = sqliteDb.each(
      `SELECT * FROM FVS_Summary`,
      (err, row: FVS_Output_Model) => {
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
