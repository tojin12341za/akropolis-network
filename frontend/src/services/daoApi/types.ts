import { Provider } from 'shared/types/models';
import { IpfsConfig } from '@aragon/apm';

export interface IDaoApiConfig {
  aragonEnsRegistry: string;
  defaultWeb3Provider: Provider;
  walletWeb3Provider: Provider;
  ipfsConfig: IpfsConfig;
  defaultGasPriceFn(): string;
}

export interface ITransitionPeriod {
  isCurrent: boolean;
  startTime: string; // at seconds
  endTime: string; // at seconds
  firstTransactionId: string;
  lastTransactionId: string;
}

export type AppType = keyof IAppMethodParams;
export type MethodByApp<T extends AppType> = keyof IAppMethodParams[T];
export type ParamsByAppByMethod<T extends AppType, M extends MethodByApp<T>> = IAppMethodParams[T][M];

interface IAppMethodParams {
  'token-manager': {
    // set
    mint: readonly [string, string]; // [holder, amount]
    // get
    maxAccountTokens: null;
    token: null;
  };
  voting: {
    // set
    vote: readonly [string, boolean, boolean]; // [voteId, isConfirmed, executesIfDecided]
    executeVote: readonly [string]; // [voteId]

  };
  finance: {
    // set
    newImmediatePayment: readonly [string, string, string, string]; // [tokenAddress, recipient, amount, reference]
    deposit: readonly [string, string, 'deposit', IIntentParams] // [tokenAddress, amount, reference, intentParams]
    // get
    getPeriodDuration: null;
    currentPeriodId: null;
    getPeriod: readonly [string]; // [periodId]
  };
  vault: {
    mock: null;
  };
  agent: {
    execute: readonly [string, number, string]; // [address, ethAmount, encodedCalldata]
  };
}

type IIntentParams = { value: string } | {
  token: { address: string, value: string };
  gas: number;
};
