import { bind } from 'decko';
import { observable, action, runInAction, when } from 'mobx';
import AragonWrapper, { ensResolve } from '@aragon/wrapper';
import ContractProxy from '@aragon/wrapper/dist/core/proxy';
import { makeProxyFromABI } from '@aragon/wrapper/dist/utils';
import { IAragonApp, ITransaction } from '@aragon/types';

import { getWeb3, getMainAccount } from 'shared/helpers/web3';
import { notifyDevWarning } from 'shared/helpers/notifyDevWarning';
import { isEthereumAddress } from 'shared/validators/isEthereumAddress/isEthereumAddress';
import { NULL_ADDRESS } from 'shared/constants';
import { IDaoApiConfig, AppType, MethodByApp, ParamsByAppByMethod } from './types';
import { currentAddress$ } from 'services/user';

interface IExtendedAragonApp extends IAragonApp {
  proxy: ContractProxy;
}

export class BaseDaoApi {
  @observable
  public wrapper: AragonWrapper | null = null;
  @observable
  private apps: IExtendedAragonApp[] = [];

  private config: IDaoApiConfig;

  constructor(config: IDaoApiConfig) {
    this.config = config;
  }

  public get web3() {
    return getWeb3(this.config.walletWeb3Provider);
  }

  public getAppByName(appName: AppType): IExtendedAragonApp | null {
    // ACL, Kernel and EVM Scripts don't have appName property
    return this.apps.find(app => !!app.appName && app.appName.startsWith(appName)) || null;
  }

  public async getAccount() {
    return getMainAccount(this.web3);
  }

  public async setDao(daoEnsName: string) {
    const { aragonEnsRegistry, defaultGasPriceFn, defaultWeb3Provider, ipfsConfig } = this.config;
    this.wrapper && this.wrapper.cancel();

    runInAction(() => {
      this.apps = [];
      this.wrapper = null;
    });

    const daoAddress = isEthereumAddress(daoEnsName) ? daoEnsName : await ensResolve(`${daoEnsName}.aragonid.eth`, {
      provider: defaultWeb3Provider,
      registryAddress: aragonEnsRegistry,
    });

    if (!daoAddress) {
      throw new Error('Dao address is not found');
    }

    const wrapper = new AragonWrapper(daoAddress, {
      provider: defaultWeb3Provider,
      defaultGasPriceFn,
      apm: {
        ensRegistryAddress: aragonEnsRegistry,
        ipfs: ipfsConfig,
      },
    });

    const account = await this.getAccount();

    await wrapper.init({
      accounts: {
        providedAccounts: account ? [account] : [],
      },
    });

    const subscriptions = {
      apps: wrapper.apps.subscribe(this.setApps),
      account: currentAddress$.subscribe(this.updateAccount),
    };

    wrapper.cancel = () => {
      Object.values(subscriptions).forEach(subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
    };

    runInAction(() => {
      this.wrapper = wrapper;
    });

    await when(() => !!this.apps.length);

    await this.initAppProxies();
  }

  public async call<T extends AppType, M extends MethodByApp<T>, P extends ParamsByAppByMethod<T, M>>(
    appType: T, method: M, params: P,
  ) {
    if (!this.wrapper) {
      throw new Error('AragonWrapper is not initialized');
    }

    const app = this.getAppByName(appType);

    if (!app) {
      throw new Error(`app for "${appType}" is not found`);
    }

    return app.proxy.call(method as any, ...(params as any || []));
  }

  public async sendTransaction<T extends AppType, M extends MethodByApp<T>, P extends ParamsByAppByMethod<T, M>>(
    appType: T, method: M, params: P,
  ) {
    if (!this.wrapper) {
      throw new Error('AragonWrapper is not initialized');
    }

    const proxy = this.getAppByName(appType);
    const proxyAddress = proxy ? proxy.proxyAddress : NULL_ADDRESS;

    const path = await this.wrapper.getTransactionPath(proxyAddress, method as string, params as any);

    notifyDevWarning(
      path.length > 1,
      'Transactions path have more than one transaction',
      { path },
    );

    const transaction = path[0];

    if (transaction) {
      transaction.pretransaction && await this._sendTransaction(transaction.pretransaction);
      await this._sendTransaction(transaction);
    }
  }

  private async _sendTransaction(transaction: ITransaction) {
    return new Promise<string>((resolve, reject) => {
      this.web3.eth
        .sendTransaction(transaction)
        .on('transactionHash', transactionHash => {
          // resolve(transactionHash);
          console.log(transactionHash);
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            // Failure based on EIP 658
            // setActivityFailed(receipt.transactionHash);
            reject('Failure based on EIP 658');
          } else {
            resolve(receipt.transactionHash);
            // setActivityConfirmed(receipt.transactionHash);
          }
        })
        .on('error', (err: any) => {
          // Called when signing failed
          // err && err.transactionHash && setActivityFailed(err.transactionHash);
          reject(err);
        });
    });
  }

  @action.bound
  private setApps(apps: IAragonApp[]) {
    this.apps = apps.map(app => ({
      ...app,
      proxy: makeProxyFromABI(app.proxyAddress, app.abi!, this.web3),
    }));
  }

  private async initAppProxies() {
    for (const app of this.apps) {
      await app.proxy.updateInitializationBlock();
    }
  }

  @bind
  private updateAccount(account: string) {
    if (!this.wrapper) {
      return;
    }
    this.wrapper.setAccounts([account]);
  }

}