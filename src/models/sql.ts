export interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  defaultValue?: string;
  fkId?: string;
  references?: {
    schema?: string;
    table: string;
    column: string;
  };
  checks?: string[];
}

export interface Table {
  name: string;
  schema?: string;
  columns: Column[];
}

export interface SqlSchema {
  tables: Table[];
} 