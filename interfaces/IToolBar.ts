export interface IToolBar {
    command?: string;
    label?: string;
    attributes?:{
      class:string;
      draggable:true;
    } ;
    id?: string
  }