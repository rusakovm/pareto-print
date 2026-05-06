type PrintFormat = "A4" | "A5" | "A6";
type PaperType = "offset80" | "coated130" | "coated170";
type BindingType = "soft" | "hard" | "staple";
type PackagingType = "none" | "individual" | "box";

type CalculatePrintData = {
  format: PrintFormat;
  paper: PaperType;
  binding: BindingType;
  packaging: PackagingType;
  pages: number;
  quantity: number;
};

export function calculatePrintPrice(data: CalculatePrintData) {
  const PRINT_FORMAT: Record<
    PrintFormat,
    { pagesPerSheet: number; printCost: number }
  > = {
    A4: { pagesPerSheet: 2, printCost: 5 },
    A5: { pagesPerSheet: 4, printCost: 6 },
    A6: { pagesPerSheet: 8, printCost: 7 },
  };

  const PAPER_COST: Record<PaperType, number> = {
    offset80: 1,
    coated130: 2.5,
    coated170: 3.2,
  };

  const BINDING_COST: Record<BindingType, number> = {
    soft: 40,
    hard: 120,
    staple: 20,
  };

  const PACKAGING_COST: Record<PackagingType, number> = {
    none: 0,
    individual: 25,
    box: 15,
  };

  const format = PRINT_FORMAT[data.format];

  const sheets = Math.ceil(data.pages / format.pagesPerSheet);

  const printCost = sheets * format.printCost * data.quantity;
  const paperCost = sheets * PAPER_COST[data.paper] * data.quantity;
  const bindingCost = BINDING_COST[data.binding] * data.quantity;
  const packagingCost = PACKAGING_COST[data.packaging] * data.quantity;

  const total =
    printCost +
    paperCost +
    bindingCost +
    packagingCost;

  return Math.round(total);
}