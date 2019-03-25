import dotenv from 'dotenv';
import knex from 'knex';
import { fvs_run_model } from 'models/fvs_run_model';
import { fvs_standinit_model } from 'models/fvs_standinit_model';
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

  if (!rowstoRun || rowstoRun.length !== 1) {
    console.log('no rows to run found');
    pg.destroy();
    return;
  }

  console.log(rowstoRun[0]);

  const updated: fvs_run_model[] = await pg
    .table('fvs_run')
    .where({ stand_id: rowstoRun[0].stand_id })
    .update({ started: true, date_started: new Date() });

  console.log(updated);

  try {
    await processRows(pg, rowstoRun[0].stand_id, rowstoRun[0].id);
    await pg
      .table('fvs_run')
      .where({ stand_id: rowstoRun[0].stand_id })
      .update({ finished: true, date_finished: new Date() });
  } catch (err) {
    console.log(err);
    await pg
      .table('fvs_run')
      .where({ stand_id: rowstoRun[0].stand_id })
      .update({ started: false });
  } finally {
    pg.destroy();
  }
};

const processRows = async (db: knex, standNID: string, jobID: string) => {
  if (!standNID || !jobID || !db) {
    throw new Error();
  }

  const rows: fvs_standinit_model[] = await db
    .table('fvs_standinit')
    .where({ stand_nid: standNID });

  console.log(rows);

  const fileName = `${rows[0].stand_id}-${jobID}`;

  await createFiles(rows[0], fileName);

  await runFVS(fileName, rows[0].variant);

  await updateFromOutputDb(rows[0].stand_id, fileName, db);

};

main();
