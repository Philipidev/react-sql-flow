import React, { useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useSqlStore } from '../../store/sqlStore';
import TableNode from './TableNode';
import FlowControls from './FlowControls';
import { useConnectionInitialization } from './hooks/useConnectionInitialization';
import { useDragHandlers } from './hooks/useDragHandlers';

// Define custom node types FORA do componente
// Isso evita que seja recriado a cada renderização
const nodeTypes = {
  tableNode: TableNode,
};

/**
 * Componente interno do diagrama SQL que utiliza o ReactFlow.
 */
const SqlFlowDiagramInner: React.FC = () => {
  const { nodes, edges, setNodes } = useSqlStore();
  const reactFlowInstance = useReactFlow();
  
  // Usando os hooks extraídos
  useConnectionInitialization(nodes, reactFlowInstance);
  const { onNodeDrag, onNodeDragStop } = useDragHandlers(nodes, setNodes);
  
  // Inicialização do diagrama
  const onInit = useCallback(() => {
    // Simplificando para evitar chamadas duplicadas
    if (nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 200);
    }
  }, [reactFlowInstance, nodes.length]);
  
  // Handler simplificado para mudanças nos nós
  const onNodesChange = useCallback(() => {
    // Vazio - a lógica está nos efeitos de useConnectionInitialization
  }, []);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onInit={onInit}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onNodesChange={onNodesChange}
      fitView
      attributionPosition="bottom-left"
      style={{ width: '100%', height: '100%' }}
      draggable={true}
      nodesDraggable={true}
      elementsSelectable={true}
      preventScrolling={false}
      snapToGrid={false}
      defaultEdgeOptions={{
        animated: true,
        type: 'smoothstep',
      }}
    >
      <FlowControls />
    </ReactFlow>
  );
};

/**
 * Componente principal do diagrama SQL, que envolve o ReactFlowProvider.
 */
const SqlFlowDiagram: React.FC = () => {
  return (
    <div 
      className="w-full h-[600px]" 
      style={{ 
        width: '100%', 
        height: '600px',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}
    >
      <ReactFlowProvider>
        <SqlFlowDiagramInner />
      </ReactFlowProvider>
    </div>
  );
};

export default SqlFlowDiagram; 