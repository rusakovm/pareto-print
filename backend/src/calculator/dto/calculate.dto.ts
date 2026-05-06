import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductType {
  BOOK = 'book',
  BROCHURE = 'brochure',
  CATALOG = 'catalog',
}

export enum PrintFormat {
  SRA3 = 'SRA3',
  A3 = 'A3',
  A4 = 'A4',
}

export enum EditionFormat {
  A4 = 'A4',
  A5 = 'A5',
  A6 = 'A6',
  B5 = 'B5',
}

export enum ColorMode {
  BW = 'bw',
  COLOR = 'color',
}

export enum PaperType {
  OFFSET_80 = 'offset80',
  COATED_130 = 'coated130',
  COATED_170 = 'coated170',
}

export enum BindingType {
  STAPLE = 'staple',
  SOFT = 'soft',
  HARD = 'hard',
}

export enum PackagingType {
  NONE = 'none',
  BOX = 'box',
  INDIVIDUAL = 'individual',
}

export enum UrgencyType {
  NORMAL = 'normal',
  FAST = 'fast',
  RUSH = 'rush',
}

export class ExtrasDto {
  @IsBoolean()
  inserts: boolean;

  @IsBoolean()
  gluedInserts: boolean;

  @IsBoolean()
  bookmark: boolean;

  @IsBoolean()
  dustJacket: boolean;

  @IsBoolean()
  varnish: boolean;

  @IsBoolean()
  lamination: boolean;
}

export class CalculateDto {
  @IsEnum(ProductType)
  productType: ProductType;

  @IsEnum(PrintFormat)
  printFormat: PrintFormat;

  @IsEnum(EditionFormat)
  editionFormat: EditionFormat;

  @IsInt()
  @Min(4)
  pages: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(ColorMode)
  colorMode: ColorMode;

  @IsEnum(PaperType)
  paper: PaperType;

  @IsEnum(BindingType)
  binding: BindingType;

  @IsEnum(PackagingType)
  packaging: PackagingType;

  @IsEnum(UrgencyType)
  urgency: UrgencyType;

  @IsObject()
  @ValidateNested()
  @Type(() => ExtrasDto)
  extras: ExtrasDto;

  @IsOptional()
  @IsBoolean()
  manualProduction?: boolean;
}