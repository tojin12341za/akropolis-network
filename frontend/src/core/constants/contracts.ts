import { IContract } from 'drizzle';

import erc20ABI from 'blockchain/abi/erc20.json';
import { NETWORK_CONFIG } from './network';

function getNetworks(contractAddress: string) {
  const defaultNetwork = { address: contractAddress };
  return new Proxy({}, {
    get: () => defaultNetwork,
  });
}

export const contracts: IContract[] = [
  {
    contractName: 'DAI',
    abi: erc20ABI as IContract['abi'],
    networks: getNetworks(NETWORK_CONFIG.daiContract),
  },
  {
    contractName: 'AKT',
    abi: erc20ABI as IContract['abi'],
    networks: getNetworks(NETWORK_CONFIG.aktContract),
  },
];
