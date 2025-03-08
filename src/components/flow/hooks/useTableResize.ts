import { useState, useRef, useCallback, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { NODE_RESIZE_EVENT } from './useHandlePositions';

interface ResizeState {
  width: number;
  height: number | 'auto';
}

/**
 * Hook customizado para gerenciar o redimensionamento de tabelas.
 * 
 * @param id ID do nó
 * @param initialWidth Largura inicial
 * @param initialHeight Altura inicial
 * @returns Objeto com estados e manipuladores para o redimensionamento
 */
export function useTableResize(id: string, initialWidth: number = 280, initialHeight: number | 'auto' = 'auto') {
  const { getNodes, setNodes } = useReactFlow();
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Referências para handlers de eventos
  const mouseMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  
  // Estado para armazenar as dimensões do nó
  const [nodeDimensions, setNodeDimensions] = useState<ResizeState>({
    width: initialWidth,
    height: initialHeight
  });
  
  // Inicia o processo de redimensionamento
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    // Importante: Essas chamadas precisam vir primeiro!
    e.stopPropagation();
    e.preventDefault();
    
    // Marca para previnir arrasto durante eventos subsequentes
    setIsResizing(true);
    
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      };
      
      // Adiciona uma classe ao nó para indicar que está sendo redimensionado
      nodeRef.current.classList.add('resizing');
      
      // Adiciona uma classe ao body para indicar modo de redimensionamento
      document.body.classList.add('resizing-mode');
    }
    
    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onResize(e);
    };
    
    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onResizeEnd();
    };
    
    // Armazena os handlers em referências
    mouseMoveHandlerRef.current = onMouseMove;
    mouseUpHandlerRef.current = onMouseUp;
    
    // Adiciona os event listeners para resize usando captura para garantir que eles sejam chamados primeiro
    window.addEventListener('mousemove', onMouseMove, { capture: true });
    window.addEventListener('mouseup', onMouseUp, { capture: true });
    
  }, []);

  // Atualiza as dimensões durante o redimensionamento
  const onResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    // Evita que o evento de mouse se propague
    e.stopPropagation();
    e.preventDefault();
    
    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    
    const newWidth = Math.max(280, resizeStartRef.current.width + deltaX);
    const newHeight = Math.max(200, resizeStartRef.current.height + deltaY);
    
    setNodeDimensions({
      width: newWidth,
      height: newHeight
    });
    
    // Atualizamos o nó no ReactFlow
    const nodes = getNodes();
    const updatedNodes = nodes.map(node => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...node.data,
            width: newWidth,
            height: newHeight
          }
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    
    // Dispara evento de redimensionamento para outros componentes que precisam ser atualizados
    document.dispatchEvent(new CustomEvent(NODE_RESIZE_EVENT, {
      detail: { nodeId: id, width: newWidth, height: newHeight }
    }));
  }, [isResizing, id, getNodes, setNodes]);
  
  // Finaliza o processo de redimensionamento
  const onResizeEnd = useCallback(() => {
    setIsResizing(false);
    
    // Remove a classe de redimensionamento
    if (nodeRef.current) {
      nodeRef.current.classList.remove('resizing');
    }
    
    // Remove a classe do body
    document.body.classList.remove('resizing-mode');
    
    // Remove os event listeners
    if (mouseMoveHandlerRef.current) {
      window.removeEventListener('mousemove', mouseMoveHandlerRef.current, { capture: true });
      mouseMoveHandlerRef.current = null;
    }
    
    if (mouseUpHandlerRef.current) {
      window.removeEventListener('mouseup', mouseUpHandlerRef.current, { capture: true });
      mouseUpHandlerRef.current = null;
    }
  }, []);
  
  // Limpa os event listeners quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Remove a classe do body se o componente for desmontado durante o redimensionamento
      if (isResizing) {
        document.body.classList.remove('resizing-mode');
      }
      
      if (mouseMoveHandlerRef.current) {
        window.removeEventListener('mousemove', mouseMoveHandlerRef.current, { capture: true });
        mouseMoveHandlerRef.current = null;
      }
      
      if (mouseUpHandlerRef.current) {
        window.removeEventListener('mouseup', mouseUpHandlerRef.current, { capture: true });
        mouseUpHandlerRef.current = null;
      }
    };
  }, [isResizing]);
  
  return {
    isResizing,
    nodeRef,
    nodeDimensions,
    onResizeStart
  };
} 