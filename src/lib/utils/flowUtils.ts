import { Node, Edge, MarkerType } from 'reactflow';
import { SqlSchema, Table } from '../../models/sql';
import { TableNodeData } from '../../models/flow';

/**
 * Generates ReactFlow nodes from SQL schema tables
 * @param schema The SQL schema containing tables
 * @returns Array of ReactFlow nodes
 */
export function generateNodes(schema: SqlSchema): Node<TableNodeData>[] {
  return schema.tables.map((table, index) => {
    // Position tables in a grid layout
    const posX = (index % 3) * 350;
    const posY = Math.floor(index / 3) * 350;
    
    return {
      id: getTableNodeId(table),
      type: 'tableNode',
      position: { x: posX, y: posY },
      data: { table },
    };
  });
}

/**
 * Generates ReactFlow edges from SQL schema tables based on foreign key relationships
 * @param schema The SQL schema containing tables
 * @returns Array of ReactFlow edges
 */
export function generateEdges(schema: SqlSchema): Edge[] {
  const edges: Edge[] = [];
  let edgeCounter = 0;
  
  // Para cada tabela
  schema.tables.forEach(sourceTable => {
    // Para cada coluna na tabela
    sourceTable.columns.forEach(column => {
      // Se a coluna for uma chave estrangeira
      if (column.isForeignKey && column.references) {
        edgeCounter++;
        
        // Informações da tabela/coluna referenciada
        const { table: targetTableName, column: targetColumnName } = column.references;
        
        // Encontrar a tabela alvo
        const targetTable = schema.tables.find(t => t.name === targetTableName);
        
        if (targetTable) {
          // Criamos apenas a aresta principal para evitar piscar da tela 
          const sourceHandle = `${sourceTable.name}-${column.name}-source`;
          
          // Usamos um handle genérico que será substituído dinamicamente no TableNode
          const targetHandle = `${targetTable.name}-${targetColumnName}-target`;
          
          // Criando apenas uma edge principal
          const edge: Edge = {
            id: `edge-${edgeCounter}`,
            source: sourceTable.name,
            target: targetTable.name,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: 'smoothstep',
            animated: true,
            style: { 
              strokeWidth: 2,
              stroke: 'var(--color-primary)',
            },
            markerEnd: {
              type: MarkerType.Arrow,
              width: 20,
              height: 20,
              color: 'var(--color-primary)'
            },
            data: {
              sourceColumn: column.name,
              targetColumn: targetColumnName
            },
            zIndex: 5,
          };
          
          edges.push(edge);
        }
      }
    });
  });
  
  return edges;
}

/**
 * Generates a unique ID for a table node
 * @param table The table
 * @returns A unique ID string
 */
export function getTableNodeId(table: Table): string {
  // Usamos somente o nome da tabela para simplicidade e consistência
  return table.name;
} 