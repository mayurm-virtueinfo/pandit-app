export interface dropdownData1 {
  id: number;
  name: string;
}

export interface dropdownData2 {
  id: number;
  title: string;
}

export interface DropdownResponse {
  data: dropdownData1[] | dropdownData2[];
}

export interface SelectorDataOption {
  data: dropdownData1[] | dropdownData2[];
}
