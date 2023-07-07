import { Network } from '@nathaj/simulator';
import { createContext } from 'react';

/**
 * React context used to provide the Network object to the whole app
 */
export const NetworkContext = createContext(new Network());
