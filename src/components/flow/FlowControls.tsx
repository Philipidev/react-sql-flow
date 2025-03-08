import React from 'react';
import { Controls, MiniMap, Background } from 'reactflow';

/**
 * Componente que agrupa os controles do ReactFlow (Controls, MiniMap, Background).
 */
const FlowControls: React.FC = () => {
  return (
    <>
      <Controls />
      <MiniMap 
        nodeColor={(node) => {
          return node.selected ? 'var(--color-primary)' : 'var(--color-secondary)';
        }}
      />
      <Background gap={12} size={1} />
    </>
  );
};

export default FlowControls; 