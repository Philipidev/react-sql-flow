import React from 'react';
import { Handle, Position } from 'reactflow';
import { Column } from '../../../models/sql';

interface TableColumnRowProps {
  column: Column;
  tableName: string;
  index: number;
  connectionPositions: Record<string, Position>;
}

/**
 * Renderiza uma linha de coluna da tabela com os handles para conexões.
 */
const TableColumnRow: React.FC<TableColumnRowProps> = ({ 
  column, 
  tableName, 
  index,
  connectionPositions 
}) => {
  const isPk = column.isPrimaryKey;
  const isFk = column.isForeignKey;
  
  return (
    <div 
      key={`${tableName}-col-${column.name}-${index}`} 
      className={`table-node__field ${isPk ? 'table-node__field-pk' : ''} ${isFk ? 'table-node__field-fk' : ''}`}
    >
      {/* Handles para chaves estrangeiras */}
      {isFk && connectionPositions[column.name] && (
        <Handle
          type="source"
          position={connectionPositions[column.name]}
          id={`${tableName}-${column.name}-source`}
          style={{ 
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--color-primary)',
            width: 8,
            height: 8,
            [connectionPositions[column.name] === Position.Left ? 'left' : 'right']: -4
          }}
        />
      )}
      
      {/* Handles para chaves primárias */}
      {isPk && (
        <>
          {/* Se temos position específica ou default para a direita */}
          {(connectionPositions[column.name] === Position.Right || 
            connectionPositions[`${column.name}-right`]) && (
            <Handle
              type="target"
              position={Position.Right}
              id={`${tableName}-${column.name}-target-right`}
              style={{ 
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--color-primary)', 
                width: 8,
                height: 8,
                right: -4
              }}
            />
          )}
          
          {/* Se temos position específica ou default para a esquerda */}
          {(connectionPositions[column.name] === Position.Left || 
            connectionPositions[`${column.name}-left`]) && (
            <Handle
              type="target"
              position={Position.Left}
              id={`${tableName}-${column.name}-target-left`}
              style={{ 
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--color-primary)', 
                width: 8,
                height: 8,
                left: -4
              }}
            />
          )}
        </>
      )}
      
      <div className="table-node__field-content">
        {/* Coluna para PK/FK */}
        <div className="column-key">
          {isPk && <span className="badge badge-pk">PK</span>}
          {isFk && <span className="badge badge-fk">FK</span>}
        </div>
        
        {/* Coluna para nome */}
        <div className="column-name">
          <span className="field-name">{column.name}</span>
          {!column.isNullable && <span className="required-marker">*</span>}
        </div>
        
        {/* Coluna para tipo */}
        <div className="column-type">
          <span>{column.type}</span>
          {isFk && (
            <div className="fk-reference">
              → {column.references?.table}.{column.references?.column}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableColumnRow; 