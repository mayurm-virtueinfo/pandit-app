export interface CustomeSelectorDataOption {
  id: number;
  name: string;
}

export interface DataSelectionState {
  data: CustomeSelectorDataOption[] | poojaDataOption[];
  selectedDataId: string | null;
  searchText: string;
}

export interface DataSelectEvent {
  dataId: string;
  dataName: string;
}

export interface poojaDataOption {
  id: number;
  title: string;
  short_description: string;
}
