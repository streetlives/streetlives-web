import React, { Component } from 'react';
import Input from '../../../../components/input';
import './OpeningHoursEditForm.css';

export default class OpeningHoursEditForm extends Component {
  render() {
    const {
      active, startTabIndex, hours, onFromChange, onToChange, addHour, removeHour,
    } = this.props;
    return hours.map((hour, i) => (
      <form
        key={i} // eslint-disable-line react/no-array-index-key
        style={{
          display: active ? 'block' : 'none',
        }}
        className="OpeningHoursEditForm"
      >
        <button
          className="default"
          onClick={() => removeHour(hour)}
        >
          <i
            className="fa fa-trash"
          />
        </button>
        <div className="table-container">
          <table>
            <tbody>
              <tr>
                <td style={{ paddingRight: '1em' }}>From:</td>
                <td>
                  <Input
                    value={(hour && hour.opensAt) || '00:00'}
                    type="time"
                    tabIndex={(startTabIndex * 100) + (i * 10) + 1}
                    onChange={e => onFromChange('opensAt', hour, e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>To:</td>
                <td>
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
            </tbody>
          </table>
        </div>
        {
          i === (hours.length - 1) &&
          <div
            className="AddMoreHoursBtn"
          >
            <button
              className="default"
              onClick={addHour}
            >
              +&nbsp;Add more hours
            </button>
          </div>
        }
      </form>
    ));
  }
}
