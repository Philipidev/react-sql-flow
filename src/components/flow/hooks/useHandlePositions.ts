import { useState, useEffect } from 'react';
import { Position, useReactFlow } from 'reactflow';
import { Column } from '../../../models/sql';

export const NODE_RESIZE_EVENT = 'node-resize-update';
export const NODE_DRAG_EVENT = 'node-drag-update';

/**
 * Hook customizado para gerenciar as posições dos handles de conexão.
 * 
 * @param id ID do nó
 * @param columns Colunas da tabela
 * @returns Objeto com as posições dos handles
 */
export function useHandlePositions(id: string, columns: Column[]) {
  const { getNode, getNodes, getEdges } = useReactFlow();
  const [connectionPositions, setConnectionPositions] = useState<Record<string, Position>>({});
  
  useEffect(() => {
    // Use uma função que será chamada por uma conexão ao store do ReactFlow
    const updateHandlePositions = (event?: CustomEvent) => {
      // Obtém todos os nós e arestas
      const nodes = getNodes();
      const edges = getEdges();
      const currentNode = getNode(id);
      
      // Se o evento existe, verifica se precisamos atualizar este nó
      if (event && event.detail) {
        // Se for um evento de inicialização ou forceUpdate, sempre atualiza
        if (event.detail.isInitialRender || event.detail.forceUpdate) {
          // Continua processando para inicializar as conexões
        } else {
          const { draggedNodeId } = event.detail;
          
          // Se não for o nó que está sendo arrastado ou uma tabela conectada, 
          // não precisamos recalcular as posições
          const isConnectedToNode = edges.some(edge => 
            (edge.source === id && edge.target === draggedNodeId) || 
            (edge.target === id && edge.source === draggedNodeId)
          );
          
          // Se este nó não é o arrastado nem está conectado ao arrastado, pula o cálculo
          if (draggedNodeId !== id && !isConnectedToNode) {
            return;
          }
        }
      }
      
      if (!currentNode) return;
      
      const positionsMap: Record<string, Position> = {};
      
      // Para cada coluna da tabela
      columns.forEach(column => {
        if (column.isForeignKey && column.references) {
          // Encontra a tabela referenciada
          const targetNode = nodes.find(node => node.id === column.references?.table);
          
          if (targetNode && currentNode) {
            // Determina se a tabela referenciada está à esquerda ou à direita
            const isTargetOnLeft = targetNode.position.x < currentNode.position.x;
            // Posiciona o handle do lado mais próximo da tabela referenciada
            positionsMap[column.name] = isTargetOnLeft ? Position.Left : Position.Right;
          } else {
            // Default fallback
            positionsMap[column.name] = Position.Left;
          }
        }
        
        if (column.isPrimaryKey) {
          // Para chaves primárias, precisamos encontrar todas as tabelas que referenciam esta
          const referencingEdges = edges.filter(edge => 
            edge.target === id && edge.targetHandle?.includes(column.name)
          );
          
          // Vamos contar quantas tabelas referenciando estão à esquerda vs direita
          let leftCount = 0;
          let rightCount = 0;
          
          referencingEdges.forEach(edge => {
            const sourceNode = nodes.find(node => node.id === edge.source);
            if (sourceNode && currentNode) {
              if (sourceNode.position.x < currentNode.position.x) {
                leftCount++;
              } else {
                rightCount++;
              }
            }
          });
          
          // Posiciona o handle da PK no lado com mais referências
          // Ou em ambos os lados se tiver referências de ambos lados
          if (leftCount > 0 && rightCount > 0) {
            positionsMap[`${column.name}-left`] = Position.Left;
            positionsMap[`${column.name}-right`] = Position.Right;
          } else if (leftCount > rightCount) {
            positionsMap[column.name] = Position.Left;
          } else {
            positionsMap[column.name] = Position.Right;
          }
        }
      });
      
      setConnectionPositions(positionsMap);
    };
    
    // Chamamos a função uma vez imediatamente
    updateHandlePositions();
    
    // Agora escutamos o evento personalizado para atualizações em tempo real durante o arraste
    const onNodeDragHandler = (event: Event) => {
      updateHandlePositions(event as CustomEvent);
    };
    
    // Adicionamos os listeners para os eventos personalizados
    document.addEventListener(NODE_DRAG_EVENT, onNodeDragHandler);
    document.addEventListener(NODE_RESIZE_EVENT, onNodeDragHandler);
    
    return () => {
      // Removemos os listeners ao desmontar
      document.removeEventListener(NODE_DRAG_EVENT, onNodeDragHandler);
      document.removeEventListener(NODE_RESIZE_EVENT, onNodeDragHandler);
    };
  }, [getNode, getNodes, getEdges, id, columns]);
  
  return connectionPositions;
} 