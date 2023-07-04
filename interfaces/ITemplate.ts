export interface ITemplate {
  name: string;
  description: string;
  content: any;
  isGlobal: boolean;
}

export interface ITemplateDetails extends ITemplate {
  id: number;
  tags: string[];
  isGlobal: boolean;
  createdBy: string;
  menuSize?: string,
  restaurant_id?:string
}
