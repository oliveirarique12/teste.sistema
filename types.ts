
export interface ProductionItem {
  id: string;
  Item: string;
  Maquina: string;
  Line_ON: string;
  Serie: string;
  Replanejamento: string;
}

export interface ProductionPlan {
  id: string;
  Componente: string;
  Maquina: string;
  Line_ON: string;
  Serie: string;
  Replanejamento: string;
  Status: 'Pendente' | 'Concluído';
  Nova_Data: string;
  Nova_Hora: string;
  Data_Atualizacao: string;
  Hora_Atualizacao: string;
  DependenciaId?: string;
  // Novos campos para gestão de materiais
  MaterialStatus: 'Disponível' | 'Faltante';
  Observacao?: string;
  MaterialResolvidoData?: string;
  MaterialResolvidoHora?: string;
}

export type ComponentType = 
  | "Mesa" 
  | "Chassi PC" 
  | "Lança" 
  | "Contra peso" 
  | "Chassi Buld" 
  | "Viga Buld" 
  | "Estrutura";

export const COMPONENTS: ComponentType[] = [
  "Mesa", "Chassi PC", "Lança", "Contra peso", 
  "Chassi Buld", "Viga Buld", "Estrutura"
];

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Em produção real, nunca salvar senha em texto puro
  role: 'admin' | 'user';
  createdAt: string;
}
