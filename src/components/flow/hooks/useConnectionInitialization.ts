import { useCallback, useRef, useState, useEffect } from 'react';
import { Node, ReactFlowInstance } from 'reactflow';
import { TableNodeData } from '../../../models/flow';
import { NODE_DRAG_EVENT } from './useHandlePositions';

/**
 * Hook customizado para gerenciar a inicialização das conexões do ReactFlow.
 * 
 * @param nodes Nós do ReactFlow
 * @param reactFlowInstance Instância do ReactFlow
 * @returns Funções e estados relacionados à inicialização das conexões
 */
export function useConnectionInitialization(
  nodes: Node<TableNodeData>[], 
  reactFlowInstance: ReactFlowInstance
) {
  const initialRenderRef = useRef(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Função para forçar a atualização de todas as conexões
  const forceUpdateConnections = useCallback(() => {
    // Evitar console.log excessivo
    document.dispatchEvent(new CustomEvent(NODE_DRAG_EVENT, { 
      detail: { 
        isInitialRender: true,
        forceUpdate: true
      } 
    }));
  }, []);
  
  // Efeito para iniciar as conexões quando o componente montar
  useEffect(() => {
    if (nodes.length > 0 && initialRenderRef.current) {
      // Sequência de atualizações das conexões, sem reiniciar o diagrama
      // Usando atrasos um pouco maiores, mas menos chamadas
      const timer1 = setTimeout(() => {
        forceUpdateConnections();
        // Depois da primeira atualização, centralizamos a visualização
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 300);
      
      // Tentativa final e marca como inicializado
      const timer2 = setTimeout(() => {
        forceUpdateConnections();
        initialRenderRef.current = false;
        setIsInitialized(true);
      }, 800);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [nodes, forceUpdateConnections, reactFlowInstance]);
  
  // Uma única atualização final após a inicialização
  useEffect(() => {
    if (nodes.length > 0 && isInitialized) {
      const updateTimer = setTimeout(() => {
        forceUpdateConnections();
      }, 1000);
      
      return () => clearTimeout(updateTimer);
    }
  }, [isInitialized, nodes.length, forceUpdateConnections]);
  
  return {
    forceUpdateConnections,
    isInitialized,
    initialRenderRef
  };
} 