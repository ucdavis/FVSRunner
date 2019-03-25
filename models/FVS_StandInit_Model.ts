// tslint:disable-next-line: class-name
export interface fvs_standinit_model {
  // TODO: remove Stand_NID, Id once we don't need them
  stand_nid: string;
  id: number;
  stand_id: string;
  variant: string;
  inv_year: number;
  groups: string;
  latitude: number;
  longitude: number;
  aspect: number;
  slope: number;
  elevation: string;
  elevft: number;
  basal_area_factor: number;
  inv_plot_size: number;
  brk_dbh: number;
  num_plots: number;
}
