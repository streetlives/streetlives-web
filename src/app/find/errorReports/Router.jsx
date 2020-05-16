import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../../notFound/NotFound';

import Thanks from './Thanks';
import ErrorReportInformationSelect from './ErrorReportInformationSelect';
import ErrorReportText from './ErrorReportText';

export default function Router(props) {
  return (
    <Switch>
      {/*
      // Previous passed props
      <ErrorReportInformationSelect
        match={this.props.match}
        generalLocationError={this.state.errorReportGeneralLocationError}
        errorReportServices={this.state.errorReportServices}
        onServiceChange={this.onErrorReportServicesChanged}
        onGeneralLocationChange={this.onErrorReportGeneralLocationErrorChanged}
        onSubmit={this.onErrorReportTextScreen}
      />
      */}
      <Route
        exact
        path={`${props.match.path}/services`}
        component={ErrorReportInformationSelect}
      />
      {/*
      // Previous passed props
      <ErrorReportText
        match={this.props.match}
        errorReportText={this.state.errorReportText}
        onChange={this.onErrorReportTextChanged}
        onSubmit={this.onErrorReportSubmitted}
      />
      */}
      <Route
        exact
        path={`${props.match.path}/text`}
        component={ErrorReportText}
      />
      <Route
        exact
        path={`${props.match.path}/thanks`}
        component={Thanks}
      />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}
