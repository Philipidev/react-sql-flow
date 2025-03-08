import { Node } from 'reactflow';
import { SqlSchema, Table } from '../../../models/sql';
import { TableNodeData } from '../../../models/flow';

/**
 * Gera o ID para um nó de tabela.
 * 
 * @param table A tabela para a qual gerar o ID
 * @returns O ID do nó
 */
export function getTableNodeId(table: Table): string {
  return table.schema ? `${table.schema}.${table.name}` : table.name;
}

/**
 * Gera nós ReactFlow a partir de tabelas do esquema SQL.
 * 
 * @param schema O esquema SQL contendo tabelas
 * @returns Array de nós ReactFlow
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