import { getService } from './service';

export const getDocuments = (state, props) => getService(state, props).DocumentsInfo || {};

export const getRequiredDocuments = (state, props) =>
  getService(state, props).RequiredDocuments || [];

export const getRequiredProofs = (state, props) =>
  (getService(state, props).documents || {}).proofs || [];

export const getDocumentRecertificationTime = (state, props) =>
  getDocuments(state, props).recertification_time;

export const getDocumentGracePeriod = (state, props) => getDocuments(state, props).grace_period;

export const getDocumentAdditionalInfo = (state, props) =>
  getDocuments(state, props).additional_info;
