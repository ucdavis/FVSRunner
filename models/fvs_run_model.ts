// tslint:disable-next-line: class-name
export interface fvs_run_model {
  run_id: number;
  stand_id: string;
  started: boolean;
  finished: boolean;
  date_started?: Date;
  date_finished?: Date;
  id: string;
}
