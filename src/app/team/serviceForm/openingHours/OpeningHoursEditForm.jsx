import React, { Component } from 'react';
import Input from '../../../../components/input';
import Icon from '../../../../components/icon';
import './OpeningHoursEditForm.css';

export default class OpeningHoursEditForm extends Component {
  render() {
    const {
      active, startTabIndex, hours, onFromChange, onToChange, addHour, removeHour, supportsNotes,
      onNoteChange,
    } = this.props;
    return hours.map((hour, i) => (
      <div
        key={i} // eslint-disable-line react/no-array-index-key
        style={{
          display: active ? 'block' : 'none',
        }}
        className="OpeningHoursEditForm"
      >
        <button
          type="button"
          className="default"
          onClick={() => removeHour(hour)}
        >
          <Icon name="trash" />
        </button>
        <div className="table-container">
          <table>
            <tbody>
              <tr>
                <td style={{ paddingRight: '1em' }}>From:</td>
                <td style={(hour && hour.opensAt) ? {} : { border: '1px solid red' }}>
                  <Input
                    value={(hour && hour.opensAt) || '00:00'}
                    type="time"
                    tabIndex={(startTabIndex * 100) + (i * 10) + 1}
                    onChange={e => onFromChange('opensAt', hour, e.target.value)}
                  />
                </td>
                <td style={{ padding: '0 1em' }}>To:</td>
                <td style={(hour && hour.closesAt) ? {} : { border: '1px solid red' }}>
                  <Input
                    value={(hour && hour.closesAt) || '23:00'}
                    type="time"
                    tabIndex={(startTabIndex * 100) + (i * 10) + 2}
                    onChange={e => onToChange('closesAt', hour, e.target.value)}
                  />
                </td>
                {!!(hour && hour.closesAt && hour.opensAt && hour.opensAt > hour.closesAt) && (
                  <td style={{ color: 'red', paddingLeft: '1em' }}>+1 day</td>
                )}
              </tr>
              {supportsNotes && (
                <tr>
                  <td style={{ paddingRight: '1em' }}>Note:</td>
                  <td colSpan={4} style={{ minWidth: '20em' }}>
                    <Input
                      fluid
                      value={(hour && hour.description) || ''}
                      placeholder="Optional, e.g. Please arrive by 5 PM. Food runs out early."
                      tabIndex={(startTabIndex * 100) + (i * 10) + 3}
                      onChange={e => onNoteChange('description', hour, e.target.value)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {
          i === (hours.length - 1) &&
          <div
            className="AddMoreHoursBtn"
          >
            <button
              type="button"
              className="default"
              onClick={addHour}
            >
              +&nbsp;Add more hours
            </button>
          </div>
        }
      </div>
    ));
  }
}
