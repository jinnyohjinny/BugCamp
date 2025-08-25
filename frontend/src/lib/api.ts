import type { Lab } from '../types/lab';

// Execute make commands via API server
export async function deployLab(labId: string): Promise<void> {
  const response = await fetch('http://localhost:3001/api/make', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      command: 'deploy',
      labId: labId 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle timeout specifically
    if (response.status === 408 || errorData.code === 'TIMEOUT') {
      throw new Error('Lab deployment is taking longer than expected. The deployment is still running in the background. You can check the status or wait a few minutes and refresh.');
    }
    
    // Handle conflict - another lab is already running
    if (response.status === 409) {
      throw new Error(errorData.error || 'Another lab is already running. Please destroy it first.');
    }
    
    throw new Error(errorData.error || `Failed to deploy lab: ${response.statusText}`);
  }
}

export async function destroyLab(labId: string): Promise<void> {
  const response = await fetch('http://localhost:3001/api/make', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      command: 'clean',
      labId: labId 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to destroy lab: ${response.statusText}`);
  }
}

export async function getLabStatus(labId: string): Promise<'running' | 'stopped'> {
  const response = await fetch(`http://localhost:3001/api/status?lab=${labId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get lab status: ${response.statusText}`);
  }

  const data = await response.json();
  return data.status;
}

export async function refreshLabsStatus(labs: Lab[]): Promise<Lab[]> {
  const updatedLabs = await Promise.all(
    labs.map(async (lab) => {
      try {
        const status = await getLabStatus(lab.id);
        return { ...lab, status };
      } catch (error) {
        console.error(`Failed to get status for lab ${lab.id}:`, error);
        return lab;
      }
    })
  );

  return updatedLabs;
}

export async function getAttackerServerStatus(): Promise<'running' | 'stopped'> {
  const response = await fetch('http://localhost:3001/api/attacker-status');
  
  if (!response.ok) {
    throw new Error(`Failed to get attacker server status: ${response.statusText}`);
  }

  const data = await response.json();
  return data.status;
}
