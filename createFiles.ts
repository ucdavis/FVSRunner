// from http://2ality.com/2018/05/child-process-streams.html
import fs from 'fs';
import { fvs_standinit_model } from 'models/fvs_standinit_model';
import sqlite3 from 'sqlite3';

export { createFiles };

const createFiles = async (
  row: fvs_standinit_model,
  fileName: string
) => {
  await createKeyFile(fileName);
  await updateKeyFile(fileName, row.stand_id);
  const sqliteDb = await new sqlite3.Database(`${fileName}-In.db`);
  await createInputDb(sqliteDb);
  await updateInputDb(row, sqliteDb);
  await sqliteDb.close();
};

const createKeyFile = async (fileName: string) => {
  await fs.copyFileSync('GENERIC.KEY', `${fileName}.KEY`);
};

const updateKeyFile = async (fileName: string, standID: string) => {
  await fs.readFile(`${fileName}.KEY`, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    const result = data.replace(/%STAND_ID_TO_REPLACE%|%FILE_NAME_TO_REPLACE%/g, (matched) => {
      return matched === '%STAND_ID_TO_REPLACE%' ? standID : fileName;
    });

    fs.writeFile(`${fileName}.KEY`, result, 'utf8', error => {
      if (error) {
        throw err;
      }
    });
  });
};

const formatValue = (value: string) => {
  if (!!value) {
    return `'${value}'`;
  } else {
    return null;
  }
};

const updateInputDb = async (
  row: fvs_standinit_model,
  sqliteDb: sqlite3.Database
) => {
  await runAsync(
    sqliteDb,
    `INSERT INTO FVS_StandInit VALUES (
      ${formatValue(row.stand_id)},
      ${formatValue(row.variant)},
      ${row.inv_year},
      ${formatValue(row.groups)},
      ${formatValue(row.addfiles)},
      ${formatValue(row.fvskeywords)},
      ${row.latitude},
      ${row.longitude},
      ${formatValue(row.region)},
      ${formatValue(row.forest)},
      ${formatValue(row.district)},
      ${formatValue(row.compartment)},
      ${formatValue(row.location)},
      ${formatValue(row.ecoregion)},
      ${formatValue(row.pv_code)},
      ${formatValue(row.pv_ref_code)},
      ${formatValue(row.age)},
      ${row.aspect},
      ${row.slope},
      ${formatValue(row.elevation)},
      ${row.elevft},
      ${row.basal_area_factor},
      ${row.inv_plot_size},
      ${row.brk_dbh},
      ${row.num_plots},
      ${formatValue(row.nonstk_plots)},
      ${formatValue(row.sam_wt)},
      ${formatValue(row.stk_pcnt)},
      ${formatValue(row.dg_trans)},
      ${formatValue(row.dg_measure)},
      ${formatValue(row.htg_trans)},
      ${formatValue(row.htg_measure)},
      ${formatValue(row.mort_measure)},
      ${formatValue(row.max_ba)},
      ${formatValue(row.max_sdi)},
      ${formatValue(row.site_species)},
      ${formatValue(row.site_index)},
      ${formatValue(row.model_type)},
      ${formatValue(row.physio_region)},
      ${formatValue(row.forest_type)},
      ${formatValue(row.state)},
      ${formatValue(row.county)},
      ${formatValue(row.fuel_model)},
      ${formatValue(row.fuel_0_25_h)},
      ${formatValue(row.fuel_25_1_h)},
      ${formatValue(row.fuel_1_3_h)},
      ${formatValue(row.fuel_3_6_h)},
      ${formatValue(row.fuel_6_12_h)},
      ${formatValue(row.fuel_12_20_h)},
      ${formatValue(row.fuel_20_35_h)},
      ${formatValue(row.fuel_35_50_h)},
      ${formatValue(row.fuel_gt_50_h)},
      ${formatValue(row.fuel_0_25_s)},
      ${formatValue(row.fuel_25_1_s)},
      ${formatValue(row.fuel_1_3_s)},
      ${formatValue(row.fuel_3_6_s)},
      ${formatValue(row.fuel_6_12_s)},
      ${formatValue(row.fuel_12_20_s)},
      ${formatValue(row.fuel_20_35_s)},
      ${formatValue(row.fuel_35_50_s)},
      ${formatValue(row.fuel_gt_50_s)},
      ${formatValue(row.fuel_litter)},
      ${formatValue(row.fuel_duff)},
      ${formatValue(row.photo_ref)},
      ${formatValue(row.photo_code)}
    )`
  );
};

const createInputDb = async (db: sqlite3.Database) => {
  await runAsync(
    db,
    `CREATE TABLE FVS_StandInit (
      Stand_ID          TEXT,
      Variant           TEXT,
      Inv_Year          INT,
      Groups            TEXT,
      AddFiles          TEXT,
      FVSKeywords       TEXT,
      Latitude          REAL,
      Longitude         REAL,
      Region            TEXT,
      Forest            TEXT,
      District          TEXT,
      Compartment       TEXT,
      Location          TEXT,
      Ecoregion         TEXT,
      PV_Code           TEXT,
      PV_Ref_Code       TEXT,
      Age               TEXT,
      Aspect            REAL,
      Slope             REAL,
      Elevation         TEXT,
      ElevFt            REAL,
      Basal_Area_Factor INT,
      Inv_Plot_Size     INT,
      Brk_DBH           INT,
      Num_Plots         INT,
      NonStk_Plots      TEXT,
      Sam_Wt            TEXT,
      Stk_Pcnt          TEXT,
      DG_Trans          TEXT,
      DG_Measure        TEXT,
      HTG_Trans         TEXT,
      HTG_Measure       TEXT,
      Mort_Measure      TEXT,
      Max_BA            TEXT,
      Max_SDI           TEXT,
      Site_Species      TEXT,
      Site_Index        TEXT,
      Model_Type        TEXT,
      Physio_Region     TEXT,
      Forest_Type       TEXT,
      State             TEXT,
      County            TEXT,
      Fuel_Model        TEXT,
      Fuel_0_25_H       TEXT,
      Fuel_25_1_H       TEXT,
      Fuel_1_3_H        TEXT,
      Fuel_3_6_H        TEXT,
      Fuel_6_12_H       TEXT,
      Fuel_12_20_H      TEXT,
      Fuel_20_35_H      TEXT,
      Fuel_35_50_H      TEXT,
      Fuel_gt_50_H      TEXT,
      Fuel_0_25_S       TEXT,
      Fuel_25_1_S       TEXT,
      Fuel_1_3_S        TEXT,
      Fuel_3_6_S        TEXT,
      Fuel_6_12_S       TEXT,
      Fuel_12_20_S      TEXT,
      Fuel_20_35_S      TEXT,
      Fuel_35_50_S      TEXT,
      Fuel_gt_50_S      TEXT,
      Fuel_Litter       TEXT,
      Fuel_Duff         TEXT,
      Photo_Ref         TEXT,
      Photo_code        TEXT
    )`
  );
};

const runAsync = (sql: sqlite3.Database, sqlQuery: string) => {
  return new Promise((resolve, reject) => {
    sql.run(sqlQuery, (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};
