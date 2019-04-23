// from http://2ality.com/2018/05/child-process-streams.html
import fs from 'fs';
import knex from 'knex';
import { fvs_standinit_model } from './models/fvs_standinit_model';
import { fvs_treeinit_model } from './models/fvs_treeinit_model';

export { createFiles };

const createFiles = async (
  standRow: fvs_standinit_model,
  treeRows: fvs_treeinit_model[],
  fileName: string
) => {
  await createKeyFile(fileName);
  // TODO: use stand_id instead of stand_nid
  await updateKeyFile(fileName, standRow.stand_nid);
  const sql = knex({
    client: 'sqlite3',
    connection: {
      filename: `./${fileName}-In.db`
    },
    useNullAsDefault: true
  });
  try {
    await createInputTables(sql);
    await sql.table('FVS_StandInit').insert(standRow);
    await sql.table('FVS_TreeInit').insert(treeRows);
  }
  catch (err) {
    throw(err);
  }
  finally {
    await sql.destroy();
  }
};

const createInputTables = async (db: knex) => {
  const standInit: fvs_standinit_model = await db.schema.createTable(
    'FVS_StandInit',
    table => {
      // TODO: remove stand_nid and id
      table.text('stand_nid');
      table.integer('id');
      table.text('stand_id');
      table.text('variant');
      table.integer('inv_year');
      table.text('groups');
      table.float('longitude');
      table.float('latitude');
      table.float('aspect');
      table.float('slope');
      table.text('elevation');
      table.float('elevft');
      table.integer('basal_area_factor');
      table.integer('inv_plot_size');
      table.integer('brk_dbh');
      table.integer('num_plots');
    }
  );

  const treeInit: fvs_treeinit_model = await db.schema.createTable(
    'FVS_TreeInit',
    table => {
      table.text('stand_nid');
      table.text('stand_id');
      table.text('standplot_id');
      table.text('plot_id');
      table.integer('tree_id');
      table.text('tree_count');
      table.text('history');
      table.text('species');
      table.float('dbh');
      table.text('dg');
      table.float('ht');
      table.text('htg');
      table.text('httopk');
      table.text('crratio');
      table.text('damage1');
      table.text('severity1');
      table.text('damage2');
      table.text('severity2');
      table.text('damage3');
      table.text('severity3');
      table.text('treevalue');
      table.text('prescription');
      table.text('age');
      table.text('slope');
      table.text('aspect');
      table.text('pv_code');
      table.text('topocode');
      table.text('siteprep');
    }
  );
};

const createKeyFile = async (fileName: string) => {
  await fs.copyFileSync('GENERIC.KEY', `${fileName}.KEY`);
};

const updateKeyFile = async (fileName: string, standID: string) => {
  await fs.readFile(`${fileName}.KEY`, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    const result = data.replace(
      /%STAND_ID_TO_REPLACE%|%FILE_NAME_TO_REPLACE%/g,
      matched => {
        return matched === '%STAND_ID_TO_REPLACE%' ? standID : fileName;
      }
    );

    fs.writeFile(`${fileName}.KEY`, result, 'utf8', error => {
      if (error) {
        throw err;
      }
    });
  });
};
