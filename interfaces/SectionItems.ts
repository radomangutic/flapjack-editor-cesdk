export class SectionItems {
    headings: string[] = ["Heading"];
    sectionColumns: number = 1;
    menuItems: IMenuItem[] = [];
    menuItemVariant: number = 1;
    priceLocation?: "top" | "bottom";
    headerAlignment: "left" | "right" | "center" = "left";
    sectionHeaderPrice: string = "10$";
    sectionFooterPrice: string = "10$";
    addOn: boolean = false;
    addOnContent: string = "Add on";
    splitHeader: boolean = false;
    hideHeader: boolean = false;
}

export interface IMenuItem {
    title: string | undefined;
    description: string | undefined;
    price: string | undefined;
    // addOn: boolean | undefined;
    // addOnContent: string | undefined;
    isSpacer?: boolean;
    spacerContent?:any;
}
