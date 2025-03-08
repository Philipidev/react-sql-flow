import { Node, Edge } from 'reactflow';
import { Table } from './sql';

export interface TableNodeData {
  table: Table;
  width?: number;
  height?: number | 'auto';
}

export type TableNode = Node<TableNodeData>;
export type TableEdge = Edge; 