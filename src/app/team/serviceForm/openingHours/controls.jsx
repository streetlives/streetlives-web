import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export const ERROR_STYLE = { color: '#A02733', fontSize: '0.8em' };

let lastId = 0;
// An id that stays the same for the life of a component, for aria-describedby and labels.
export function useId(prefix) {
  const id = useRef(null);
  if (!id.current) {
    lastId += 1;
    id.current = `${prefix}-${lastId}`;
  }
  return id.current;
}

// Keeps Tab inside `container` while it's open.
const trapTab = container => (e) => {
  if (e.key !== 'Tab') return;
  const focusable = [...container.querySelectorAll('button:not([disabled]), input, select')];
  const [first, last] = [focusable[0], focusable[focusable.length - 1]];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};

// For a drawer or dialog: takes focus when it opens, keeps Tab inside, and Esc cancels.
export function useModal(ref, onCancel) {
  const cancel = useRef(onCancel);
  cancel.current = onCancel;

  useEffect(() => {
    const modal = ref.current;
    modal.querySelector('button, input').focus();
    const keepTab = trapTab(modal);
    const onKeyDown = (e) => {
      if (e.key === 'Escape') cancel.current();
      keepTab(e);
    };
    modal.addEventListener('keydown', onKeyDown);
    return () => modal.removeEventListener('keydown', onKeyDown);
  }, [ref]);
}

// A toggle button, such as a day of the week or a month.
export function Chip({
  selected, onClick, children, title, label,
}) {
  return (
    <button
      type="button"
      className="oh-chip"
      aria-pressed={selected}
      aria-label={label}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

Chip.propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  label: PropTypes.string,
};

// One choice out of a few, as joined buttons: "Week | Month".
export function Segmented({
  label, options, value, onChange,
}) {
  return (
    <div role="radiogroup" aria-label={label} className="oh-seg">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.value === value && <span aria-hidden="true">✓ </span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}

Segmented.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.node,
  })).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
};

export function Switch({ checked, label, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="oh-switch"
      onClick={() => onChange(!checked)}
    >
      <span><span /></span>
    </button>
  );
}

Switch.propTypes = {
  checked: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

// A time picker. A time still being filled in is empty, so it can't be saved half done.
export function TimeInput({
  value, onChange, label, invalid,
}) {
  return (
    <input
      type="time"
      className="oh-input oh-time"
      aria-label={label}
      aria-invalid={invalid}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
    />
  );
}

TimeInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  invalid: PropTypes.bool,
};

// A date and a button that does something with it, revealed by a link: "+ Skip a date".
export function DateAction({
  label, action, onSubmit, isDisabled,
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const id = useId('date-action');
  const disabled = !date || isDisabled(date);
  const submit = () => {
    onSubmit(date);
    setDate('');
    setOpen(false);
  };
  if (!open) {
    return (
      <button type="button" className="oh-btn" onClick={() => setOpen(true)}>{label}</button>
    );
  }
  return (
    <span className="oh-inline">
      <label htmlFor={id} className="oh-sr-only">{label}</label>
      <input
        id={id}
        type="date"
        className="oh-input"
        value={date}
        onChange={e => setDate(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          if (!disabled) submit();
        }}
      />
      <button type="button" className="oh-btn" disabled={disabled} onClick={submit}>
        {action}
      </button>
    </span>
  );
}

DateAction.propTypes = {
  label: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isDisabled: PropTypes.func,
};

DateAction.defaultProps = { isDisabled: () => false };

// "next day" after a closing time earlier than its opening time.
export const NextDayTag = ({ range }) => (range.opensAt && range.closesAt &&
  range.closesAt <= range.opensAt ? <span className="oh-tag">next day</span> : null);

export const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M3 5h12M7 5V3h4v2M5 5l1 10h6l1-10" />
  </svg>
);

// Moves focus to the first field marked invalid inside `container`.
export function focusFirstProblem(container) {
  const field = container && container.querySelector('[aria-invalid="true"], .oh-error');
  if (!field) return;
  field.scrollIntoView({ block: 'center' });
  if (field.focus) field.focus();
}
