import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, StaticRouter } from 'react-router-dom';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import { DrizzleContext } from 'drizzle-react';
import { Drizzle } from 'drizzle';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import 'normalize.css';

import { I18nProvider } from 'services/i18n';
import { IAppData, IModule, IJssDependencies, IDependencies } from 'shared/types/app';
import { JssProvider, SheetsRegistry, BaseStyles } from 'shared/styles';

import createRoutes from './routes';
import { DepsContext } from './DepsReactContext';

interface IAppProps {
  jssDeps: IJssDependencies;
  disableStylesGeneration?: boolean;
}

export function App({ modules, store, jssDeps, disableStylesGeneration, deps, drizzle }: IAppData & IAppProps) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {renderSharedPart({ modules, drizzle, jssDeps, disableStylesGeneration, deps })}
      </BrowserRouter>
    </Provider >
  );
}

interface IServerAppProps extends IAppProps {
  registry?: SheetsRegistry;
}

export function ServerApp(props: IAppData & IServerAppProps & StaticRouter['props']) {
  const { modules, store, registry, jssDeps, disableStylesGeneration, drizzle, deps, ...routerProps } = props;
  return (
    <Provider store={store}>
      <StaticRouter {...routerProps}>
        {renderSharedPart({ modules, drizzle, jssDeps, disableStylesGeneration, registry, deps })}
      </StaticRouter>
    </Provider>
  );
}

interface ISharedProps {
  modules: IModule[];
  drizzle: Drizzle;
  jssDeps: IJssDependencies;
  deps: IDependencies;
  disableStylesGeneration?: boolean;
  registry?: SheetsRegistry;
}

function renderSharedPart(
  { modules, drizzle, jssDeps, disableStylesGeneration, registry, deps }: ISharedProps,
) {
  const { generateClassName, jss, theme } = jssDeps;

  return (
    <ApolloProvider client={deps.apolloClient}>
      <ApolloHooksProvider client={deps.apolloClient}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <DrizzleContext.Provider drizzle={drizzle}>
            <DepsContext.Provider value={deps}>
              <I18nProvider>
                <JssProvider
                  jss={jss}
                  registry={registry}
                  generateClassName={generateClassName}
                  disableStylesGeneration={disableStylesGeneration}
                >
                  <MuiThemeProvider theme={theme} disableStylesGeneration={disableStylesGeneration}>
                    {/* <React.StrictMode> */}
                    <BaseStyles />
                    {createRoutes(modules)}
                    {/* </React.StrictMode> */}
                  </MuiThemeProvider>
                </JssProvider>
              </I18nProvider>
            </DepsContext.Provider>
          </DrizzleContext.Provider>
        </MuiPickersUtilsProvider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
}
