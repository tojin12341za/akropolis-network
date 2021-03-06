import { getAsyncContainer } from 'core/FeatureConnector';
import * as namespace from './namespace';
import { loadEntry } from './loader';

export { namespace };
export { Entry } from './entry';

export const JointToCooperativeButtonAsync = getAsyncContainer(loadEntry, 'JoinToCooperativeButton');
