import { getService } from './service';

export const getDocuments = (state, props) => getService(state, props).DocumentsInfo || {};

export const getRequiredDocuments = (state, props) =>
  getService(state, props).RequiredDocuments || [];

// TODO Replace whenever form supports multiple proofs
export const getFirstProof = (state, props) =>
  (getRequiredDocuments(state, props)[0] || {}).document;

export const getDocumentRecertificationTime = (state, props) =>
  getDocuments(state, props).recertification_time;

export const getDocumentGracePeriod = (state, props) => getDocuments(state, props).grace_period;

export const getDocumentAdditionalInfo = (state, props) =>
  getDocuments(state, props).additional_info;
