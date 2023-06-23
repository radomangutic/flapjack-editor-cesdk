export interface IFont {
  id: number;
  name: string;
  titleFont: {
    name: string;
    url: string;
    custom?: boolean;
  };
  headerFont: {
    name: string;
    url: string;
    custom?: boolean;
  };
  bodyFont: {
    name: string;
    url: string;
    custom?: boolean;
  };
  menuFont: {
    name: string;
    url: string;
    custom?: boolean;
  };
  menuFontSize: number
  headerFontSize: number
  titleFontSize: number
  bodyFontSize: number
}
