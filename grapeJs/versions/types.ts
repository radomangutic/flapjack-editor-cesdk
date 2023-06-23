export type ComponentData = Partial<{
  components: Array<ComponentData>;
  classes: string[];
  tagName: string;
  type: string;
  content: string;
  attributes: {
    [key: string]: any;
  };
}>;

export type FrameData = {
  component: ComponentData;
}

export type PageData = {
  id: string;
  type: string;
  frames: FrameData[];
};

export type StyleData = {
  style: any;
  selectors: string[];
  selectorsAdd?: string;
};

export type TemplateData = {
  pages: PageData[];
  assets: string[];
  styles: StyleData[];
};

export type TemplateContent = TemplateData &
  Partial<{
    meta: {
      version: string;
    };
  }>;
