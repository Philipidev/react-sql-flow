import React from 'react';

interface TableResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
}

/**
 * Componente que renderiza o manipulador de redimensionamento da tabela.
 */
const TableResizeHandle: React.FC<TableResizeHandleProps> = ({ onResizeStart }) => {
  return (
    <div 
      className="resize-handle"
      onMouseDown={(e) => {
        // Impede que o evento de clique se propague para o nó
        e.stopPropagation();
        // Inicia o processo de redimensionamento
        onResizeStart(e);
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 22 8 18 8 22 4" />
        <path d="M2 22V2" />
        <path d="M22 22H2" />
      </svg>
    </div>
  );
};

export default TableResizeHandle; 