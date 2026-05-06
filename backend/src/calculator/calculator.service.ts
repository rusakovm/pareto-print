import { Injectable } from '@nestjs/common';
import {
  BindingType,
  CalculateDto,
  ColorMode,
  EditionFormat,
  PackagingType,
  PaperType,
  PrintFormat,
  ProductType,
  UrgencyType,
} from './dto/calculate.dto';

@Injectable()
export class CalculatorService {
  calculate(dto: CalculateDto) {
    const quantity = Math.max(1, Number(dto.quantity) || 1);
    const pages = Math.max(4, Number(dto.pages) || 4);

    const printFormatMap: Record<PrintFormat, { basePagesPerSheet: number; printCost: number }> = {
      [PrintFormat.SRA3]: { basePagesPerSheet: 4, printCost: 7.5 },
      [PrintFormat.A3]: { basePagesPerSheet: 4, printCost: 8.5 },
      [PrintFormat.A4]: { basePagesPerSheet: 2, printCost: 6.5 },
    };

    const editionFormatFactor: Record<EditionFormat, number> = {
      [EditionFormat.A4]: 1,
      [EditionFormat.A5]: 0.8,
      [EditionFormat.A6]: 0.65,
      [EditionFormat.B5]: 0.9,
    };

    const paperMap: Record<PaperType, number> = {
      [PaperType.OFFSET_80]: 2.4,
      [PaperType.COATED_130]: 4.8,
      [PaperType.COATED_170]: 6.2,
    };

    const bindingMap: Record<BindingType, number> = {
      [BindingType.STAPLE]: 18,
      [BindingType.SOFT]: 75,
      [BindingType.HARD]: 180,
    };

    const packagingMap: Record<PackagingType, number> = {
      [PackagingType.NONE]: 0,
      [PackagingType.BOX]: 14,
      [PackagingType.INDIVIDUAL]: 32,
    };

    const urgencyMap: Record<UrgencyType, number> = {
      [UrgencyType.NORMAL]: 0,
      [UrgencyType.FAST]: 0.12,
      [UrgencyType.RUSH]: 0.25,
    };

    const productBasePrepress: Record<ProductType, number> = {
      [ProductType.BOOK]: 2500,
      [ProductType.BROCHURE]: 1800,
      [ProductType.CATALOG]: 2200,
    };

    const selectedPrintFormat = printFormatMap[dto.printFormat];
    const editionFactor = editionFormatFactor[dto.editionFormat];

    const pagesPerSheet = Math.max(
      1,
      Math.round(selectedPrintFormat.basePagesPerSheet / editionFactor),
    );

    const sheetsPerCopy = Math.ceil(pages / pagesPerSheet);

    const colorMultiplier = dto.colorMode === ColorMode.COLOR ? 1.85 : 1;

    let prepressCost = productBasePrepress[dto.productType];
    const printCost = sheetsPerCopy * selectedPrintFormat.printCost * colorMultiplier * quantity;
    const paperCost = sheetsPerCopy * paperMap[dto.paper] * quantity;

    let bindingCost = bindingMap[dto.binding] * quantity;

    if (
      (dto.binding === BindingType.HARD || dto.binding === BindingType.SOFT) &&
      (dto.editionFormat === EditionFormat.A4 || dto.editionFormat === EditionFormat.B5)
    ) {
      bindingCost *= 1.1;
    }

    let manualProductionCost = 0;
    if (dto.manualProduction) {
      manualProductionCost = 35 * quantity;
    }

    let extrasCost = 0;

    if (dto.extras.inserts) extrasCost += 6 * quantity;
    if (dto.extras.gluedInserts) extrasCost += 12 * quantity;
    if (dto.extras.bookmark) extrasCost += 10 * quantity;
    if (dto.extras.dustJacket) extrasCost += 35 * quantity;
    if (dto.extras.varnish) extrasCost += 16 * quantity;
    if (dto.extras.lamination) extrasCost += 18 * quantity;

    const packagingCost = packagingMap[dto.packaging] * quantity;

    const subtotal =
      prepressCost +
      printCost +
      paperCost +
      bindingCost +
      extrasCost +
      packagingCost +
      manualProductionCost;

    const urgencyCost = subtotal * urgencyMap[dto.urgency];

    let quantityDiscount = 0;
    if (quantity >= 300) quantityDiscount = subtotal * 0.07;
    if (quantity >= 1000) quantityDiscount = subtotal * 0.12;

    const total = Math.max(0, Math.round(subtotal + urgencyCost - quantityDiscount));
    const pricePerCopy = Math.round(total / quantity);

    return {
      input: dto,
      result: {
        pagesPerSheet,
        sheetsPerCopy,
        prepressCost: Math.round(prepressCost),
        printCost: Math.round(printCost),
        paperCost: Math.round(paperCost),
        bindingCost: Math.round(bindingCost),
        extrasCost: Math.round(extrasCost),
        packagingCost: Math.round(packagingCost),
        manualProductionCost: Math.round(manualProductionCost),
        urgencyCost: Math.round(urgencyCost),
        quantityDiscount: Math.round(quantityDiscount),
        total,
        pricePerCopy,
      },
    };
  }
}