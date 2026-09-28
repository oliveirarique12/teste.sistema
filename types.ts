
export type ProcessType = 'TW' | 'SAW' | 'RAW';

export const PROCESS_LIST: { id: ProcessType; label: string; description: string }[] = [
  { id: 'TW', label: 'Tack Welding (TW)', description: 'Ponteamento e Montagem' },
  { id: 'SAW', label: 'Arco Submerso (SAW)', description: 'Solda Automática Arco Submerso' },
  { id: 'RAW', label: 'Robô de Solda (RAW)', description: 'Célula Robot Arc Welding' }
];

export type MainframeSubComponent = 
  | 'Carcaça Central' 
  | 'Longarina Direita' 
  | 'Longarina Esquerda' 
  | 'Mancais/Munhão' 
  | 'Chapas de Fundo/Reforços';

export const MAINFRAME_SUBCOMPONENTS: MainframeSubComponent[] = [
  'Carcaça Central',
  'Longarina Direita',
  'Longarina Esquerda',
  'Mancais/Munhão',
  'Chapas de Fundo/Reforços'
];

export const DEFAULT_MACHINES: string[] = [
  'PC200-8M0', 'PC210-10M0', 'PC360-8M0', 'PC390-10M0', 
  'D51EX-22', 'D61EX-23', 'WA320-6', 'WA380-6', 'GD655-5'
];

export type UserRole = 'operador' | 'supervisor' | 'coordenador' | 'chefe';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  processAccess: ProcessType[] | 'ALL';
  createdAt: string;
}

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
  SubComponente?: string;
  Processo: ProcessType;
  Maquina: string;
  Line_ON: string;
  Serie: string;
  Replanejamento: string;
  Status: 'Pendente' | 'Concluído';
  Nova_Data: string;
  Nova_Hora: string;
  Data_Atualizacao: string;
  Hora_Atualizacao: string;
  MaterialStatus: 'Disponível' | 'Faltante';
  Observacao?: string;
  MaterialResolvidoData?: string;
  MaterialResolvidoHora?: string;
  AtualizadoPor?: string;
}

export const COMPONENTS = ['Mesa', 'Mainframe', 'Chassi PC', 'Chassi Buld', 'Braço', 'Caçamba'] as const;
export type ComponentType = typeof COMPONENTS[number];

