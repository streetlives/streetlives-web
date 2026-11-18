import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  newSpecialHours, describeClosure, describeClosureWhen, describeSpecialHours,
  describeSpecialDates, describeSpecialTimes, getClosureError, getSpecialHoursError, nyToday,
} from './recurrence';
import { TrashIcon } from './controls';
import ExceptionDialog from './ExceptionDialog';

// Holidays and exceptions, described, for view mode.
export function ExceptionsView({ closures, specialHours }) {
  return (
    <>
      {!!closures.length && (
        <div className="mb-3">
          <div className="font-weight-bold">Closures that repeat</div>
          {closures.map(closure => (
            <div key={describeClosure(closure)}>{describeClosure(closure)}</div>
          ))}
        </div>
      )}
      {!!specialHours.length && (
        <div className="mb-3">
          <div className="font-weight-bold">Special hours</div>
          {specialHours.map(entry => (
            <div key={`${entry.validFrom}-${entry.description}`}>{describeSpecialHours(entry)}</div>
          ))}
        </div>
      )}
    </>
  );
}

ExceptionsView.propTypes = {
  closures: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  specialHours: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

function ExceptionRow({
  icon, iconClass, name, when, hours, error, onEdit, onRemove,
}) {
  return (
    <div className="oh-exception">
      <div className="oh-exception-row">
        <span aria-hidden="true" className={`oh-exception-icon${iconClass}`}>{icon}</span>
        <strong>{name}</strong>
        <span>{error ? 'Needs fixing' : when}</span>
        <span>{error ? '' : hours}</span>
        <div className="oh-exception-actions">
          <button type="button" className="oh-link" aria-label={`Edit ${name}`} onClick={onEdit}>
            Edit
          </button>
          <button
            type="button"
            className="oh-icon-btn"
            aria-label={`Remove ${name}`}
            onClick={onRemove}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      {error && (
        <div className="oh-row-error oh-error" role="alert" tabIndex={-1}>
          <span className="oh-flex"><strong>!</strong> {error}</span>
        </div>
      )}
    </div>
  );
}

ExceptionRow.propTypes = {
  icon: PropTypes.string.isRequired,
  iconClass: PropTypes.string,
  name: PropTypes.string.isRequired,
  when: PropTypes.string.isRequired,
  hours: PropTypes.string.isRequired,
  error: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

ExceptionRow.defaultProps = { iconClass: '', error: null };

const without = (list, index) => list.filter((_, i) => i !== index);

// The days that don't follow the regular hours, in one list: closures that come back every
// year or month, so nobody has to enter Christmas again next year, and special hours on
// particular dates, which replace everything else on them. They're added and edited in a dialog.
function ExceptionsEdit({
  closures, specialHours, onChange, requestedDate, onRequestHandled,
}) {
  // What the dialog has open: 'closure' or 'special', the item, its index (-1 for a new one),
  // and where focus goes back to.
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!requestedDate) return;
    setEditing({
      kind: 'special',
      value: newSpecialHours({
        validFrom: requestedDate,
        closed: false,
        hours: [{ opensAt: '09:00', closesAt: '17:00' }],
      }),
      index: -1,
      opener: document.activeElement,
    });
    onRequestHandled();
  }, [requestedDate, onRequestHandled]);

  const open = (kind, value, index, e) => setEditing({
    kind, value, index, opener: e.currentTarget,
  });
  const close = () => {
    const { opener } = editing;
    setEditing(null);
    if (opener && opener.isConnected) opener.focus();
  };
  // An edit can turn a closure into special hours, or the other way round.
  const save = ({ kind, value }) => {
    const lists = {
      closure: editing.kind === 'closure' && editing.index >= 0
        ? without(closures, editing.index) : closures,
      special: editing.kind === 'special' && editing.index >= 0
        ? without(specialHours, editing.index) : specialHours,
    };
    const at = kind === editing.kind && editing.index >= 0
      ? editing.index : lists[kind].length;
    lists[kind] = [...lists[kind].slice(0, at), value, ...lists[kind].slice(at)];
    onChange({ closures: lists.closure, specialHours: lists.special });
    close();
  };

  return (
    <section className="oh-section" aria-labelledby="oh-exceptions">
      <div className="oh-section-head">
        <h2 id="oh-exceptions">Holidays &amp; exceptions</h2>
        <button
          type="button"
          className="oh-btn"
          onClick={e => open('special', newSpecialHours(), -1, e)}
        >
          + Add holiday or exception
        </button>
      </div>
      <p className="oh-help">
        Days this service is closed or keeps different hours. These replace the regular hours.
      </p>

      {!!(closures.length + specialHours.length) && (
        <div className="oh-table">
          {closures.map((closure, i) => (
            <ExceptionRow
              // eslint-disable-next-line react/no-array-index-key
              key={`closure-${i}`}
              icon="✕"
              name={closure.description || 'Closure'}
              when={describeClosureWhen(closure)}
              hours="Closed"
              error={getClosureError(closure)}
              onEdit={e => open('closure', closure, i, e)}
              onRemove={() => onChange({ closures: without(closures, i) })}
            />
          ))}
          {specialHours.map((entry, i) => {
            const error = getSpecialHoursError(entry);
            return (
              <ExceptionRow
                // eslint-disable-next-line react/no-array-index-key
                key={`special-${i}`}
                icon="★"
                iconClass=" is-special"
                name={entry.description || 'Special hours'}
                when={entry.validFrom ? describeSpecialDates(entry) : ''}
                hours={describeSpecialTimes(entry)}
                error={error && error.message}
                onEdit={e => open('special', entry, i, e)}
                onRemove={() => onChange({ specialHours: without(specialHours, i) })}
              />
            );
          })}
        </div>
      )}

      {editing && (
        <ExceptionDialog
          kind={editing.kind}
          value={editing.value}
          isNew={editing.index < 0}
          today={nyToday()}
          onSave={save}
          onCancel={close}
        />
      )}
    </section>
  );
}

ExceptionsEdit.propTypes = {
  closures: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  specialHours: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  // ({ closures, specialHours }), with the ones that changed.
  onChange: PropTypes.func.isRequired,
  // YYYY-MM-DD: a date to open the dialog on, for special hours.
  requestedDate: PropTypes.string,
  onRequestHandled: PropTypes.func,
};

ExceptionsEdit.defaultProps = { requestedDate: null, onRequestHandled: () => {} };

export default ExceptionsEdit;
