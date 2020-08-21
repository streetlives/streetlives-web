import React from 'react';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';
import Header from '../../../../components/header';
import Selector from '../../../../components/selector';

import { getLabelByValues } from './options';

const MembershipCriteriaView = ({
  value: { eligible_values: eligibleValues, description } = {}, onEdit, onConfirm,
}) => (
  <div className="container-fluid">
    <Header>Any membership criteria?</Header>

    <Selector fluid>
      { eligibleValues &&
        <Selector.Option active>{ getLabelByValues(eligibleValues) }</Selector.Option>
      }
    </Selector>

    <p>{ description }</p>

    <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
  </div>
);

export default MembershipCriteriaView;
