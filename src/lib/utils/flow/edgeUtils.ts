import { Edge, MarkerType } from 'reactflow';
import { SqlSchema } from '../../../models/sql';
import { getTableNodeId } from './nodeUtils';

/**
 * Gera arestas ReactFlow a partir de relacionamentos de chave estrangeira no esquema SQL.
 * 
 * @param schema O esquema SQL contendo tabelas
 * @returns Array de arestas ReactFlow
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
          const sourceHandle = `${getTableNodeId(sourceTable)}-${column.name}-source`;
          
          // Usamos um handle genérico que será substituído dinamicamente no TableNode
          const targetHandle = `${getTableNodeId(targetTable)}-${targetColumnName}-target`;
          
          // Criando apenas uma edge principal
          const edge: Edge = {
            id: `edge-${edgeCounter}`,
            source: getTableNodeId(sourceTable),
            target: getTableNodeId(targetTable),
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