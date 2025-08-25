export interface Lab {
  id: string;
  level: string;
  name: string;
  description: string;
  vulnerability: string;
  port: number;
  objective: string;
  category: string;
  status: 'stopped' | 'running';
  hacked: boolean;
}

export interface Level {
  name: string;
  description: string;
  labs: Lab[];
}

export interface LabsData {
  levels: Level[];
}
