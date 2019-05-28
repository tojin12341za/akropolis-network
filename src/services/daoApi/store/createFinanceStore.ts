import Web3 from 'web3';
import * as R from 'ramda';
import BN from 'bignumber.js';
import ContractProxy from '@aragon/wrapper/dist/core/proxy';

import vaultAbi from 'blockchain/abi/vault.json';
import { NETWORK_CONFIG } from 'core/constants';
import { IFinanceTransaction, IFinanceHolder } from 'shared/types/models';
import { ONE_ERC20 } from 'shared/constants';
import { addressesEqual } from 'shared/helpers/web3';

import { IEvent, IFinanceState } from './types';
import { getStore } from './getStore';

type VaultEvent = IEvent<string, {
  token: string;
}>;

type NewTransactionEvent = IEvent<'NewTransaction', {
  reference: string;
  transactionId: string;
}>;

type Event =
  | VaultEvent
  | NewTransactionEvent;

export const initialFinanceState: IFinanceState = {
  holders: {},
  transactions: {},
  vaultAddress: '',
  daoOverview: {
    balance: 0,
    credit: 0,
    debit: 0,
  },
  ready: false,
};

export async function createFinanceStore(web3: Web3, proxy: ContractProxy) {
  const vaultAddress: string = await proxy.call('vault');
  const vaultProxy = new ContractProxy(vaultAddress, vaultAbi, web3);
  await vaultProxy.updateInitializationBlock();

  return getStore(
    async (state: IFinanceState, events: Event[], isCompleteLoading: boolean): Promise<IFinanceState> => {
      const vaultMainCoinEvents = events
        .filter((event): event is VaultEvent => event.address === vaultAddress)
        .filter(event => event.returnValues.token === NETWORK_CONFIG.daiContract);
      const otherEvents = events.filter((event): event is Exclude<Event, VaultEvent> => event.address !== vaultAddress);

      const isNeedLoadBalance = !!vaultMainCoinEvents.length;
      const transactionsForLoad = R.uniq(otherEvents
        .filter((event): event is NewTransactionEvent => event.event === 'NewTransaction')
        .map(event => event.returnValues.transactionId));

      const daoBalance = isNeedLoadBalance
        ? new BN(await vaultProxy.call('balance', NETWORK_CONFIG.daiContract)).div(ONE_ERC20).toNumber()
        : state.daoOverview.balance;

      const mainCoinNewTransactions: IFinanceTransaction[] = (await Promise.all(
        transactionsForLoad.map(async id => ({ id, ...await proxy.call('getTransaction', id)})),
      )).map<IFinanceTransaction>(item => ({
        ...item,
        amount: new BN(item.amount).div(ONE_ERC20).toNumber(),
        date: parseInt(item.date, 10) * 1000,
      })).filter(item => addressesEqual(item.token, NETWORK_CONFIG.daiContract));

      const nextTransactions = mainCoinNewTransactions.length
        ? {
          ...state.transactions,
          ...R.indexBy(R.prop('id'), mainCoinNewTransactions),
        } : state.transactions;

      const holders: Record<string, IFinanceHolder> = mainCoinNewTransactions.length
        ? reduceHolders(nextTransactions)
        : state.holders;

      const daoOverview: IFinanceState['daoOverview'] = {
        balance: daoBalance,
        credit: R.sum(Object.values(holders).map(item => item.credit)),
        debit: R.sum(Object.values(holders).map(item => item.debit)),
      };

      return {
        ...state,
        holders,
        daoOverview,
        vaultAddress,
        transactions: nextTransactions,
        ready: isCompleteLoading,
      };
    },
    initialFinanceState,
    [
      proxy.events(),
      vaultProxy.events(),
    ],
  );
}

function reduceHolders(nextTransactions: { [x: string]: IFinanceTransaction; }): Record<string, IFinanceHolder> {
  return Object
    .values(nextTransactions)
    .reduce<Record<string, IFinanceHolder>>((acc, cur) => {
      const prevHolderState: IFinanceHolder = acc[cur.entity] || {
        address: cur.entity,
        balance: 0,
        credit: 0,
        debit: 0,
      };
      const holder: IFinanceHolder = {
        ...prevHolderState,
        balance: prevHolderState.balance + (cur.isIncoming ? cur.amount : -cur.amount),
        credit: prevHolderState.credit + (cur.isIncoming ? 0 : cur.amount),
        debit: prevHolderState.debit + (cur.isIncoming ? cur.amount : 0),
      };
      return { ...acc, [cur.entity]: holder };
    }, {});
}
