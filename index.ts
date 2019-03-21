import dotenv from 'dotenv';
import knex from 'knex';
import { fvs_run_model } from 'models/fvs_run_model';
import { fvs_standinit_model } from 'models/FVS_StandInit_Model';
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

  const rowstoRun: fvs_run_model[] = await pg
    .table('fvs_run')
    .where({ started: false, finished: false })
    .limit(1);

  console.log(rowstoRun[0]);

  await pg.table('fvs_run')
    .where({ stand_id: rowstoRun[0].stand_id })
    .update({ started: true });

  try {
    await processRows(pg, rowstoRun[0].stand_id);
  } catch (err) {
    console.log(err);
    await pg.table('fvs_run')
    .where({ stand_id: rowstoRun[0].stand_id })
    .update({ started: false });
    pg.destroy();
    return;
  }
  await pg.table('fvs_run')
  .where({ stand_id: rowstoRun[0].stand_id })
  .update({ finished: true });

  pg.destroy();
};

const processRows = async (db: knex, standNID: string) => {
  if (!standNID || !db) {
    console.log('Error');
    return;
  }

  const rows: fvs_standinit_model[] = await db
    .table('fvs_standinit')
    .where({ stand_nid: standNID });

  console.log(rows);

  const standID = rows[0].stand_id;

  await createFiles(rows[0], db);

  await runFVS(standID, 'ws');

  await updateFromOutputDb(standID, db);

  await deleteFiles(standID);
};

main();
