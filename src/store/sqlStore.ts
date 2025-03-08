import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { SqlSchema } from '../models/sql';
import { TableNodeData } from '../models/flow';
import { parseSqlScript } from '../lib/parser/sqlParser';
import { generateNodes, generateEdges } from '../lib/utils/flow';
import exampleSql from '../example/example1.sql?raw';

interface SqlFlowState {
  sqlScript: string;
  schema: SqlSchema | null;
  nodes: Node<TableNodeData>[];
  edges: Edge[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSqlScript: (script: string) => void;
  setNodes: (nodes: Node<TableNodeData>[]) => void;
  processSqlScript: () => void;
  clearError: () => void;
  resetState: () => void;
}

export const useSqlStore = create<SqlFlowState>((set, get) => ({
  sqlScript: exampleSql,
  schema: null,
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  
  setSqlScript: (script) => set({ sqlScript: script }),
  
  setNodes: (nodes) => set({ nodes }),
  
  processSqlScript: () => {
    const { sqlScript } = get();
    
    if (!sqlScript.trim()) {
      set({ error: 'SQL script cannot be empty' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Parse the SQL script
      const schema = parseSqlScript(sqlScript);
      
      if (schema.tables.length === 0) {
        set({ 
          isLoading: false, 
          error: 'No tables found in the SQL script. Make sure it contains CREATE TABLE statements.' 
        });
        return;
      }
      
      // Generate nodes and edges
      const nodes = generateNodes(schema);
      const edges = generateEdges(schema);
      
      set({ 
        schema,
        nodes,
        edges,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: `Error processing SQL script: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  },
  
  clearError: () => set({ error: null }),
  
  resetState: () => set({ 
    sqlScript: '',
    schema: null,
    nodes: [],
    edges: [],
    isLoading: false,
    error: null 
  })
})); 