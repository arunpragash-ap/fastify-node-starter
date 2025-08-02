export interface CreateOrUpdateOptionDTO {
  id?: number;
  type: string;
  name?: string;
  remarks?: string;
  status?: boolean;
}

export interface OptionListItem {
  id: number;
  type: string;
  name: string;
}

export interface OptionDetailItem {
  id: number;
  type: string;
  name: string;
  remarks?: string;
  status: boolean;
}
