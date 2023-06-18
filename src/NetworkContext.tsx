import { createContext } from "react";
import { Network } from "./simulator/network/Network";

export const NetworkContext = createContext(new Network());
