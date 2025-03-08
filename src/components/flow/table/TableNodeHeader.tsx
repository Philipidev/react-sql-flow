import React from 'react';

interface TableNodeHeaderProps {
  name: string;
  schema?: string;
}

/**
 * Renderiza o cabeçalho de uma tabela.
 */
export const TableNodeHeader: React.FC<TableNodeHeaderProps> = ({ name, schema }) => {
  return (
    <div className="table-node__header">
      <span className="table-name">
        {schema ? `${schema}.${name}` : name}
      </span>
    </div>
  );
};

export default TableNodeHeader; 