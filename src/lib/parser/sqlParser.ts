import { Column, Table, SqlSchema } from '../../models/sql';

/**
 * Parses a SQL Server script and extracts table definitions
 * @param sqlScript The SQL Server script to parse
 * @returns A schema object containing tables and their columns
 */
export function parseSqlScript(sqlScript: string): SqlSchema {
  const tables: Table[] = [];
  
  // Extract CREATE TABLE statements
  const createTableRegex = /CREATE\s+TABLE\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)\s*\(([\s\S]*?)(?:\)(?:;|$|\n\s*\n))/gi;
  let match;
  
  while ((match = createTableRegex.exec(sqlScript)) !== null) {
    const schema = match[1];
    const tableName = match[2];
    const tableContent = match[3];
    
    const table: Table = {
      name: tableName,
      schema: schema,
      columns: parseColumns(tableContent)
    };
    
    tables.push(table);
  }
  
  // Process foreign key relationships
  processForeignKeys(tables, sqlScript);
  
  return { tables };
}

/**
 * Parses column definitions from a table content string
 * @param tableContent The content inside the CREATE TABLE parentheses
 * @returns An array of column objects
 */
function parseColumns(tableContent: string): Column[] {
  const columns: Column[] = [];
  
  // Split by commas, but be careful with commas inside parentheses (for CHECK constraints)
  const lines = splitByCommaOutsideParentheses(tableContent);
  
  // Extract primary key constraint
  const pkConstraintRegex = /CONSTRAINT\s+\[?(\w+)\]?\s+PRIMARY\s+KEY\s+\(\s*\[?(\w+)\]?\s*(?:,\s*\[?(\w+)\]?\s*)*\)/i;
  const pkMatch = tableContent.match(pkConstraintRegex);
  let primaryKeyColumns: string[] = [];
  
  if (pkMatch) {
    // Extract column names from the primary key constraint
    const pkColumnsStr = pkMatch[0].match(/\(([^)]+)\)/)?.[1] || '';
    primaryKeyColumns = pkColumnsStr
      .split(',')
      .map(col => col.trim().replace(/^\[|\]$/g, ''));
  }
  
  // Process each line
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip constraints for now
    if (trimmedLine.startsWith('CONSTRAINT') && !trimmedLine.includes('PRIMARY KEY')) {
      continue;
    }
    
    // Skip foreign key declarations
    if (trimmedLine.match(/^\s*FOREIGN\s+KEY\s*\(/i)) {
      continue;
    }
    
    // Parse column definition
    const columnRegex = /^\s*\[?(\w+)\]?\s+(\w+(?:\s*\(\s*\d+(?:\s*,\s*\d+)?\s*\))?)\s*(.*?)$/i;
    const columnMatch = trimmedLine.match(columnRegex);
    
    if (columnMatch) {
      const columnName = columnMatch[1];
      let columnType = columnMatch[2];
      const columnConstraints = columnMatch[3];
      
      // Limpe o tipo da coluna para remover qualquer referência a FOREIGN KEY
      if (columnType.includes('FOREIGN')) {
        columnType = columnType.replace(/FOREIGN\s+KEY\s*/gi, '').trim();
      }
      
      const column: Column = {
        name: columnName,
        type: columnType,
        isPrimaryKey: primaryKeyColumns.includes(columnName) || 
                      columnConstraints.includes('PRIMARY KEY'),
        isForeignKey: false, // Will be set later
        isNullable: !columnConstraints.includes('NOT NULL'),
        checks: []
      };
      
      // Extract default value
      const defaultMatch = columnConstraints.match(/DEFAULT\s+([^,]+)/i);
      if (defaultMatch) {
        column.defaultValue = defaultMatch[1].trim();
      }
      
      // Extract check constraints
      const checkMatch = columnConstraints.match(/CHECK\s*\(([^)]+)\)/i);
      if (checkMatch) {
        column.checks = [checkMatch[1].trim()];
      }
      
      columns.push(column);
    }
  }
  
  return columns;
}

/**
 * Processes foreign key constraints and updates column references
 * @param tables The array of tables to process
 * @param sqlScript The original SQL script
 */
function processForeignKeys(tables: Table[], sqlScript: string): void {
  let fkCounter = 0; // Contador global para garantir IDs únicos
  
  // Remover qualquer texto 'FOREIGN' dos tipos de colunas
  // Este passo garante que "FOREIGN KEY" não apareça nos tipos das colunas
  tables.forEach(table => {
    table.columns.forEach(column => {
      // Limpa o tipo da coluna se contiver a palavra "FOREIGN"
      if (column.type.includes('FOREIGN')) {
        column.type = column.type.replace(/FOREIGN\s+KEY\s*/gi, '').trim();
      }
    });
  });
  
  // Extract foreign key constraints from CREATE TABLE statements
  const fkRegex = /CREATE\s+TABLE\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)\s*\([\s\S]*?FOREIGN\s+KEY\s*\(\s*\[?(\w+)\]?\s*\)\s*REFERENCES\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)\s*\(\s*\[?(\w+)\]?\s*\)/gi;
  let fkMatch;
  
  while ((fkMatch = fkRegex.exec(sqlScript)) !== null) {
    fkCounter++;
    const tableName = fkMatch[2]; // A tabela que contém a FK
    const columnName = fkMatch[3]; // A coluna que é a FK
    const refTableSchema = fkMatch[4];
    const refTableName = fkMatch[5]; // A tabela referenciada pela FK
    const refColumnName = fkMatch[6]; // A coluna referenciada pela FK
    
    // Encontre a tabela específica que contém esta FK
    const table = tables.find(t => t.name === tableName);
    if (table) {
      const column = table.columns.find(col => col.name === columnName);
      if (column) {
        column.isForeignKey = true;
        // ID único que inclui a tabela de origem, a coluna e um contador
        column.fkId = `fk-${tableName}-${columnName}-${fkCounter}`;
        column.references = {
          schema: refTableSchema,
          table: refTableName,
          column: refColumnName
        };
      }
    }
  }
  
  // Also look for standalone FOREIGN KEY constraints in CREATE TABLE
  const standaloneFK = /CREATE\s+TABLE\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)\s*\(([\s\S]*?)(?:\)(?:;|$|\n\s*\n))/gi;
  let tableMatch;
  
  // Para cada declaração CREATE TABLE
  while ((tableMatch = standaloneFK.exec(sqlScript)) !== null) {
    const tableName = tableMatch[2];
    const tableContent = tableMatch[3];
    
    // Procure por chaves estrangeiras dentro do conteúdo da tabela
    const innerFKRegex = /FOREIGN\s+KEY\s*\(\s*\[?(\w+)\]?\s*\)\s*REFERENCES\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)\s*\(\s*\[?(\w+)\]?\s*\)/gi;
    let innerFKMatch;
    
    while ((innerFKMatch = innerFKRegex.exec(tableContent)) !== null) {
      fkCounter++;
      const columnName = innerFKMatch[1];
      const refTableSchema = innerFKMatch[2];
      const refTableName = innerFKMatch[3];
      const refColumnName = innerFKMatch[4];
      
      // Encontre a tabela
      const table = tables.find(t => t.name === tableName);
      if (table) {
        const column = table.columns.find(col => col.name === columnName);
        if (column) {
          column.isForeignKey = true;
          column.fkId = `fk-${tableName}-${columnName}-${fkCounter}`;
          column.references = {
            schema: refTableSchema,
            table: refTableName,
            column: refColumnName
          };
        }
      }
    }
  }
  
  // Look for ALTER TABLE statements that add foreign keys
  const alterFkRegex = /ALTER\s+TABLE\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)\s+ADD\s+(?:CONSTRAINT\s+\[?\w+\]?\s+)?FOREIGN\s+KEY\s*\(\s*\[?(\w+)\]?\s*\)\s*REFERENCES\s+(?:\[?(\w+)\]?\.)?(?:\[?(\w+)\]?)\s*\(\s*\[?(\w+)\]?\s*\)/gi;
  let alterFkMatch;
  
  while ((alterFkMatch = alterFkRegex.exec(sqlScript)) !== null) {
    fkCounter++;
    const tableName = alterFkMatch[2];
    const columnName = alterFkMatch[3];
    const refTableSchema = alterFkMatch[4];
    const refTableName = alterFkMatch[5];
    const refColumnName = alterFkMatch[6];
    
    // Find the table
    const table = tables.find(t => t.name === tableName);
    if (table) {
      const column = table.columns.find(col => col.name === columnName);
      if (column) {
        column.isForeignKey = true;
        column.fkId = `fk-${tableName}-${columnName}-${fkCounter}`;
        column.references = {
          schema: refTableSchema,
          table: refTableName,
          column: refColumnName
        };
      }
    }
  }
}

/**
 * Splits a string by commas that are not inside parentheses
 * @param input The input string to split
 * @returns An array of strings split by commas outside parentheses
 */
function splitByCommaOutsideParentheses(input: string): string[] {
  const result: string[] = [];
  let current = '';
  let parenthesesLevel = 0;
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    
    if (char === '(') {
      parenthesesLevel++;
      current += char;
    } else if (char === ')') {
      parenthesesLevel--;
      current += char;
    } else if (char === ',' && parenthesesLevel === 0) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    result.push(current);
  }
  
  return result;
} 