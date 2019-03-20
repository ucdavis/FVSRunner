import dotenv from 'dotenv';
import knex from 'knex';
import { FVS_StandInit_Model } from 'models/FVS_StandInit_Model';
import { createFiles } from './createFiles';
import { deleteFiles } from './deleteFiles';
import { runFVS } from './runFVS';
import { updateFromOutputDb } from './updateFromOutputDb';

const main = async () => {
  dotenv.config();

  console.log('connecting to db', process.env.DB_HOST);
  // https://knexjs.org/
  const pg = knex({
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: 'FVSRunner'
    }
  });

  // while (
  //   pg
  //     .table('FVS_StandInit_Small')
  //     .where({ FVS_Run: false })
  //     .select('Stand_ID')
  //     .limit(1) !== null
  // ) {

  await processRows(pg);
  // }

  pg.destroy();
};

const processRows = async (db: knex) => {
  const rows: FVS_StandInit_Model[] = await db
  .table('FVS_StandInit_Small')
  .where({ FVS_Run: false })
  .distinct()
  .limit(1);

  console.log(rows[0]);

  const standID = rows[0].Stand_ID;
  const variant = rows[0].Variant;

  if (!standID || !variant || !db) {
    console.log('Error');
    return;
  }
  console.log(standID);

  await createFiles(rows[0], db);

  await runFVS(standID, variant);

  await updateFromOutputDb(standID, db);

  await deleteFiles(standID);
};

main();
