import { useCallback, useRef } from 'react';
import { Node, NodeDragHandler } from 'reactflow';
import { TableNodeData } from '../../../models/flow';
import { NODE_DRAG_EVENT } from './useHandlePositions';

/**
 * Hook customizado para lidar com eventos de arrasto.
 * 
 * @param nodes Nós do ReactFlow
 * @param setNodes Função para atualizar os nós
 * @returns Manipuladores de eventos de arrasto
 */
export function useDragHandlers(
  nodes: Node<TableNodeData>[], 
  setNodes: (nodes: Node<TableNodeData>[]) => void
) {
  const isDraggingRef = useRef(false);
  
  // Função para atualizar a posição durante o arraste
  const onNodeDrag: NodeDragHandler = useCallback(
    (event, node) => {
      // Marca que estamos em um processo de arraste
      isDraggingRef.current = true;
      
      // Atualiza apenas o nó que está sendo arrastado, mantendo os outros intactos
      setNodes(
        nodes.map((n) => {
          if (n.id === node.id) {
            return { ...n, position: node.position };
          }
          return n;
        })
      );
      
      // Dispara um evento personalizado para que os TableNodes possam atualizar suas conexões
      document.dispatchEvent(new CustomEvent(NODE_DRAG_EVENT, { 
        detail: { 
          draggedNodeId: node.id, 
          position: node.position 
        } 
      }));
    },
    [nodes, setNodes]
  );
  
  // Função para lidar com o final do arraste dos nós
  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      // Marca que o arraste terminou
      isDraggingRef.current = false;
      
      // Atualiza a posição final do nó após soltar
      setNodes(
        nodes.map((n) => {
          if (n.id === node.id) {
            return { ...n, position: node.position };
          }
          return n;
        })
      );
      
      // Dispara evento final para atualizar as conexões
      document.dispatchEvent(new CustomEvent(NODE_DRAG_EVENT, { 
        detail: { 
          draggedNodeId: node.id, 
          position: node.position, 
          isDragComplete: true 
        } 
      }));
    },
    [nodes, setNodes]
  );
  
  return {
    onNodeDrag,
    onNodeDragStop,
    isDraggingRef
  };
} 