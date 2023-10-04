const getCurrentSelectedPage = async (instance: any) => {
  const pages = instance.engine.block.findByType("page");
  console.log("pages", pages);

  if (pages?.length > 1) {
    const selectedBlocks = await instance.engine.block.findAllSelected();
    if (selectedBlocks?.length === 0) {
      return pages[pages.length - 1];
    }
    const targetBlock = selectedBlocks[0];
    if (instance.engine.block.getType(targetBlock) == "//ly.img.ubq/page") {
      return targetBlock;
    }
    let currentID = targetBlock;
    let parentID = instance.engine.block.getParent(currentID);

    while (instance.engine.block.getType(parentID) != "//ly.img.ubq/page") {
      const swapID = currentID;
      currentID = parentID;
      parentID = instance.engine.block.getParent(swapID);
    }
    return currentID;
  } else {
    return pages[0];
  }
};
export { getCurrentSelectedPage };
