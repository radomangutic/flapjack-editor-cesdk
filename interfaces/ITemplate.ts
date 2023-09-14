export interface ITemplate {
  name: string;
  description: string;
  content: any;
  isGlobal: boolean;
  id: number;
  createdBy: string;
}

export interface ITemplateDetails extends ITemplate {
  id: number;
  tags?: string[];
  isGlobal: boolean;
  createdBy: string;
  menuSize?: string;
  restaurant_id?: string;
  location?: string;
  updatedAt?: string;
}

export interface DeleteAssetsIDs {
  id: string;
  content: string;
}
