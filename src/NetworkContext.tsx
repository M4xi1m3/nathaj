import { createContext } from 'react';
import { Network } from './simulator/network/Network';

/**
 * React context used to provide the Network object to the whole app
 */
export const NetworkContext = createContext(new Network());
