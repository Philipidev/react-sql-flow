import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { TableNodeData } from '../../models/flow';

import TableNodeHeader from './table/TableNodeHeader';
import TableColumnHeader from './table/TableColumnHeader';
import TableColumnRow from './table/TableColumnRow';
import TableResizeHandle from './table/TableResizeHandle';

import { useTableResize } from './hooks/useTableResize';
import { useHandlePositions } from './hooks/useHandlePositions';

/**
 * Componente de nó que renderiza uma tabela no diagrama.
 */
const TableNode: React.FC<NodeProps<TableNodeData>> = ({ data, id }) => {
  const { table } = data;
  
  // Usando os hooks extraídos
  const connectionPositions = useHandlePositions(id, table.columns);
  
  const { 
    nodeRef, 
    nodeDimensions, 
    onResizeStart 
  } = useTableResize(
    id,
    data.width || 280, 
    data.height || 'auto'
  );
  
  return (
    <div 
      ref={nodeRef}
      className="table-node"
      style={{ 
        width: `${nodeDimensions.width}px`,
        ...(nodeDimensions.height !== 'auto' ? { height: `${nodeDimensions.height}px` } : {})
      }}
    >
      <TableNodeHeader 
        name={table.name} 
        schema={table.schema} 
      />
      
      <TableColumnHeader />
      
      <div className="table-node__content">
        {table.columns.map((column, index) => (
          <TableColumnRow
            key={`${table.name}-col-${column.name}-${index}`}
            column={column}
            tableName={table.name}
            index={index}
            connectionPositions={connectionPositions}
          />
        ))}
      </div>
      
      <TableResizeHandle onResizeStart={onResizeStart} />
    </div>
  );
};

export default memo(TableNode); 