import dotenv from 'dotenv';
import knex from 'knex';
import { fvs_run_model } from 'models/fvs_run_model';
import { fvs_standinit_model } from 'models/fvs_standinit_model';
import { fvs_treeinit_model } from 'models/fvs_treeinit_model';
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

  const standRows: fvs_standinit_model[] = await db
    .table('fvs_standinit')
    .where({ stand_nid: standNID });

  const treeRows: fvs_treeinit_model[] = await db
    .table('fvs_treeinit')
    .where({ stand_nid: standNID }); // TODO: change to standNID when they match

  const fileName = `${standNID}-${jobID}`;

  await createFiles(standRows[0], treeRows, fileName);

  await runFVS(fileName, standRows[0].variant);

  await updateFromOutputDb(standNID, fileName, db);

  // TODO: can move this into finally() of try/catch once stand_id == stand_nid
  await deleteFiles(fileName);
};

main();
