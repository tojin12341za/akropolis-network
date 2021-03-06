import * as React from 'react';
import { Form } from 'react-final-form';
import { connect } from 'react-redux';
import { GetProps } from '_helpers';

import { selectors as userSelectors } from 'services/user';
import { IAppReduxState } from 'shared/types/app';
import { Grid, Button, CircleProgressBar } from 'shared/view/elements';

import UserAvatar from '../UserAvatar/UserAvatar';
import { StylesProps, provideStyles } from './RequestForm.style';

interface IStateProps {
  userAddress: string | null;
}

function mapState(state: IAppReduxState): IStateProps {
  return {
    userAddress: userSelectors.selectConfirmedAddress(state),
  };
}

interface IOwnProps {
  cancelButton: React.ReactNode;
  submitButton: React.ReactNode;
  fields: React.ReactNode[];
  disabled?: boolean;
  withoutAddress?: boolean;
  onCancel(): void;
}

type IProps = IOwnProps & IStateProps & StylesProps & GetProps<typeof Form>;

function RequestForm(props: IProps) {
  const {
    onCancel, userAddress, classes, cancelButton,
    submitButton, fields, disabled, withoutAddress, ...formRest
  } = props;

  return (
    <Form {...formRest} subscription={{ ...formRest.subscription, submitting: true }} >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={40}>
            <Grid item xs={12}>
              <Grid container spacing={24}>
                {!withoutAddress && userAddress &&
                  <Grid item xs={12}>
                    <Grid container wrap="nowrap" justify="center">
                      <UserAvatar address={userAddress} className={classes.address} />
                    </Grid>
                  </Grid>
                }
                {fields.map((field, i) => (
                  <Grid item xs={12} key={i}>
                    {field}
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={32}>
                <Grid item xs={6} container justify="flex-end" onClick={onCancel}>
                  <Button>{cancelButton}</Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={submitting || disabled}
                  >
                    {!submitting ? submitButton : <CircleProgressBar size={16} />}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      )}
    </Form>
  );
}

export default (
  connect(mapState)(provideStyles(RequestForm))
);
