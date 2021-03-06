import * as React from 'react';
import * as cn from 'classnames';
import { MarkAs } from '_helpers';
import BigNumber from 'bignumber.js';

import { useTranslate, tKeys as tKeysAll, ITranslateKey } from 'services/i18n';
import { useDaoApi } from 'services/daoApi';

import {
  IInvestmentState, InvestmentStatus, InvestmentType, InvestmentCategory, FutureInvestmentType, IInvestmentApi,
} from 'shared/types/models';
import { AsyncActionButton, Metric } from 'shared/view/components';
import { NumberInputField } from 'shared/view/form';
import { Grid, Typography } from 'shared/view/elements';
import { Settings, Info } from 'shared/view/elements/Icons';
import { formatPercent, formatDAI } from 'shared/helpers/format';
import { useHasActiveEnableInvestmentVoting } from 'shared/helpers/voting';
import { isRequired, composeValidators, moreThen, lessThenOrEqual } from 'shared/validators';

import { StylesProps, provideStyles } from './ProductCard.style';

import CompoundIcon from './icons/CompoundIcon.svg';
import DharmaIcon from './icons/DharmaIcon.svg';
import SetIcon from './icons/SetIcon.svg';
import UmaIcon from './icons/UmaIcon.svg';
import MelonportIcon from './icons/MelonportIcon.svg';

const tKeys = tKeysAll.features.investments;

const gridContainerProps = { container: true, wrap: 'nowrap', alignItems: 'center' } as any;

const categoryByType: Record<InvestmentType | FutureInvestmentType, InvestmentCategory> = {
  compound: 'saving',
  dharma: 'credit',
  set: 'investment',
  uma: 'investment',
  melonport: 'investment',
};

const iconByType: Record<InvestmentType | FutureInvestmentType, string> = {
  compound: CompoundIcon,
  dharma: DharmaIcon,
  set: SetIcon,
  uma: UmaIcon,
  melonport: MelonportIcon,
};

interface IOwnProps {
  depositLimit: BigNumber;
  state: IInvestmentState;
  api: IInvestmentApi;
  type: InvestmentType | FutureInvestmentType;
  disabled?: boolean;
  isComingSoon?: boolean;
}

type IProps = StylesProps & IOwnProps;

interface IFormData {
  amount: number;
}

const fieldNames: { [key in keyof IFormData]: key } = {
  amount: 'amount',
};

export const ProductCard = React.memo(provideStyles((props: IProps) => {
  const { classes, api, state, type, depositLimit, disabled, isComingSoon } = props;
  const { balance, currentRate, earned, isEnabled } = state;
  const { t } = useTranslate();

  const daoApi = useDaoApi();
  const hasActiveEnableVoting = useHasActiveEnableInvestmentVoting(daoApi, type);

  const withdraw = React.useCallback(({ amount }: IFormData) => api.withdraw(amount), []);
  const deposit = React.useCallback(({ amount }: IFormData) => api.deposit(amount), []);

  const status: InvestmentStatus =
    isComingSoon && 'waiting' ||
    isEnabled && 'active' ||
    'need-enable';

  const metric = React.useCallback((title: string, value: string) => (
    <Grid item xs={6}>
      <Metric title={title} value={value} />
    </Grid>
  ), []);

  const formFields = [(
    <NumberInputField
      suffix=" DAI"
      name={fieldNames.amount}
      label={t(tKeys.fields.amount.getKey())}
      fullWidth
    />
  )];

  const validateWithdraw = React.useCallback(({ amount }: IFormData):
    Partial<MarkAs<ITranslateKey, IFormData>> => {
    return {
      amount: composeValidators<number>(
        isRequired,
        moreThen.bind(null, 0),
        lessThenOrEqual.bind(null, balance),
      )(amount),
    };
  }, [balance]);

  const validateDeposit = React.useCallback(({ amount }: IFormData):
    Partial<MarkAs<ITranslateKey, IFormData>> => {
    return {
      amount: composeValidators<number>(
        isRequired,
        moreThen.bind(null, 0),
        lessThenOrEqual.bind(null, depositLimit),
      )(amount),
    };
  }, [depositLimit]);

  const footerByStatus: Record<InvestmentStatus, () => React.ReactNode> = {
    ['waiting']: () => (
      <Grid {...gridContainerProps} justify="center" className={classes.waiting} >
        <Settings className={classes.waitingIcon} />
        <Typography variant="body2" weight="medium" className={classes.waitingLabel}>
          {t(tKeys.waiting.getKey())}
        </Typography>
      </Grid>),
    ['need-enable']: () => (
      <Grid {...gridContainerProps} spacing={8} className={classes.needEnable} >
        <Grid item>
          <Info className={classes.infoIcon} />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1" className={classes.enableLabel}>
            {t(tKeys.needEnableDescription[type].getKey())}
          </Typography>
        </Grid>
        <Grid item className={classes.enableButton} xs={4}>
          <AsyncActionButton
            buttonProps={{
              disabled: disabled || hasActiveEnableVoting,
              fullWidth: true,
              color: 'primary',
            }}
            buttonText={t(tKeys.enable.getKey())}
            executeAction={api.enable}
          />
        </Grid>
      </Grid>),
    ['active']: () => (
      <Grid {...gridContainerProps} justify="space-between" spacing={24} className={classes.actionsButton}>
        <Grid item xs={6}>
          <AsyncActionButton
            buttonProps={{
              disabled,
              fullWidth: true,
              color: 'primary',
            }}
            buttonText={t(tKeys.withdraw.getKey())}
            executeAction={withdraw}
            form={{
              title: t(tKeys.withdrawModalTitle[type].getKey()),
              fields: formFields,
              submitButtonText: t(tKeys.transfer.getKey()),
              formProps: {
                validate: validateWithdraw,
              },
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <AsyncActionButton
            buttonProps={{
              disabled,
              fullWidth: true,
              color: 'primary',
            }}
            buttonText={t(tKeys.supply.getKey())}
            executeAction={deposit}
            form={{
              title: t(tKeys.supplyModalTitle[type].getKey()),
              fields: formFields,
              submitButtonText: t(tKeys.transfer.getKey()),
              formProps: {
                validate: validateDeposit,
              },
            }}
          />
        </Grid>
      </Grid>),
  };

  return (
    <div className={classes.root}>
      <Grid className={classes.header} {...gridContainerProps}>
        <Typography
          variant="overline"
          weight="medium"
          component="div"
          className={classes.typeBadge}
        >
          {t(tKeys.categories[categoryByType[type]].getKey())}
        </Typography>
        <Typography className={classes.title} variant="body2">{t(tKeys.descriptions[type].getKey())}</Typography>
      </Grid>
      <div className={cn(classes.content, { [classes.isDisabled]: status === 'waiting' })}>
        <Grid {...gridContainerProps} className={classes.profit}>
          <img src={iconByType[type]} className={classes.icon} />
          <Typography variant="h6" className={classes.annualProfit}>
            {formatPercent(currentRate.toNumber(), 2)}{' APR'}
          </Typography>
        </Grid>

        <Grid {...gridContainerProps} className={classes.metrics}>
          {metric(t(tKeys.balance.getKey()), formatDAI(balance.toNumber(), 4))}
          {metric(t(tKeys.earned.getKey()), formatDAI(earned.toNumber(), 4))}
        </Grid>
        {footerByStatus[status]()}
      </div>
    </div>
  );
}));
