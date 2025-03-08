import React from 'react';

/**
 * Renderiza o cabeçalho das colunas da tabela.
 */
const TableColumnHeader: React.FC = () => {
  return (
    <div className="table-node__column-header">
      <div className="column-key">PK/FK</div>
      <div className="column-name">Nome</div>
      <div className="column-type">Tipo</div>
    </div>
  );
};

export default TableColumnHeader; 