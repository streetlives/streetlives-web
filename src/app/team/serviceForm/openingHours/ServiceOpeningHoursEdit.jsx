import React, { Component } from 'react';
import moment from 'moment';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';
import { DAYS } from '../../../../Constants';
import OpeningHoursEditForm from './OpeningHoursEditForm';
import ExceptionsEdit, { ExceptionsView } from './ExceptionsEdit';
import SchedulePreview from './SchedulePreview';
import WeekTable from './WeekTable';
import PatternDrawer from './PatternDrawer';
import { ERROR_STYLE, Segmented, focusFirstProblem } from './controls';
import {
  readSchedule, applySchedule, isSpecialHoursValid, newAtom, groupAtoms, cardKey, addCard,
  skipCardDate, unskipCardDate, describeCard, getCardError, getClosureError, describeConflicts,
  describeSchedule, fillWeek, splitCard, nyToday, atomKey,
} from './recurrence';
import './OpeningHours.css';

const NOTHING_ACTIVE = -1;
const IS_247_ACTIVE = 0;
const IS_NOT_247_ACTIVE = 1;
const IS_CLOSED = 2;
const MIDNIGHT = '00:00';
const ELEVEN_FIFTY_NINE = '23:59';

const ALL_DAY_ATOMS = DAYS.map(day => newAtom({
  day, opensAt: MIDNIGHT, closesAt: ELEVEN_FIFTY_NINE,
}));

const STATUS_OPTIONS = [
  { value: IS_CLOSED, label: 'Closed' },
  { value: IS_247_ACTIVE, label: 'Open 24/7' },
  { value: IS_NOT_247_ACTIVE, label: 'Set hours' },
];
const IS_MAC = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

// 24/7 is one card open all day on every day, every week, with no dates or skips.
const isAllDayEveryDay = cards => cards.length === 1 &&
  cardKey(cards[0]) === cardKey(groupAtoms(ALL_DAY_ATOMS)[0]) && cards[0].days.length === 7;

// A row that says the whole service is closed: closed, with no dates and no repeat rule.
const isClosedMarker = row => row.closed && !row.freq && !row.validFrom;

function getActive(rows, supportsRecurrence) {
  if (supportsRecurrence) {
    const { atoms, closures, specialHours } = readSchedule(rows);
    if (atoms.length) {
      return isAllDayEveryDay(groupAtoms(atoms)) ? IS_247_ACTIVE : IS_NOT_247_ACTIVE;
    }
    if (rows.some(isClosedMarker)) return IS_CLOSED;
    // Only closures or special hours, such as a one-time event.
    return closures.length || specialHours.length ? IS_NOT_247_ACTIVE : NOTHING_ACTIVE;
  }

  const hours = rows;
  if (hours.length > 0 && hours.filter(({ closed }) => !closed).length === 0) {
    return IS_CLOSED;
  }

  const is247 = DAYS.every(weekday => (
    hours &&
      hours.find(hour => (
        hour.weekday === weekday &&
        hour.opensAt === MIDNIGHT &&
        hour.closesAt === ELEVEN_FIFTY_NINE
      ))
  ));

  if (hours && hours.length) {
    if (is247) {
      return IS_247_ACTIVE;
    }
    return IS_NOT_247_ACTIVE;
  }
  return NOTHING_ACTIVE;
}

function checkAllHoursValid(hours) {
  return hours.every(hour => hour.closed || (hour.opensAt != null && hour.closesAt != null));
}

const getOpenRegularHours = rows => rows.filter(({ closed }) => !closed);

function formatTime(time) {
  const m = moment(time, 'hh:mm');
  if (!m.isValid()) {
    return '';
  }

  return m.minutes() ? m.format('h:mmA') : m.format('hA');
}

function formatHours(hours) {
  const s1 = formatTime(hours.opensAt);
  const s2 = formatTime(hours.closesAt);
  return s1 && s2 ? `${s1} to ${s2}` : '';
}

function splitOvernightHours(hours) {
  const getNextWeekday = weekday => DAYS[(DAYS.indexOf(weekday) + 1) % DAYS.length];

  return hours.reduce((splitHours, hour) => {
    const isOvernight = hour && hour.closesAt && hour.opensAt && hour.opensAt > hour.closesAt;
    if (!isOvernight) {
      return [...splitHours, hour];
    }

    const beforeMidnight = {
      ...hour,
      weekday: hour.weekday,
      opensAt: hour.opensAt,
      closesAt: ELEVEN_FIFTY_NINE,
    };
    const afterMidnight = {
      ...hour,
      weekday: getNextWeekday(hour.weekday),
      opensAt: MIDNIGHT,
      closesAt: hour.closesAt,
    };

    return [...splitHours, beforeMidnight, afterMidnight];
  }, []);
}

class ServiceOpeningHours extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.removeHour = this.removeHour.bind(this);
    this.state = {
      active: getActive(props.value, props.supportsRecurrence),
      weekdaysOpen: {},
      hours: getOpenRegularHours(props.value),
      latestHoursEntered: null,
      schedule: readSchedule(props.value),
      // The card open in the drawer: the atoms it was opened with or made since, the atoms
      // to go back to on Cancel, and the element to return focus to.
      drawer: null,
      // A date from the calendar to add special hours on.
      exceptionDate: null,
    };
    this.editor = React.createRef();
    this.savedHours = JSON.stringify(this.getHoursToSave());
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillReceiveProps(props) {
    if (props.value && props.value !== this.props.value) {
      this.setState({
        hours: getOpenRegularHours(props.value),
        active: getActive(props.value, props.supportsRecurrence),
        schedule: readSchedule(props.value),
      }, () => { this.savedHours = JSON.stringify(this.getHoursToSave()); });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  // Ctrl+S (Cmd+S on a Mac) saves, unless a drawer or dialog is open.
  onKeyDown = (e) => {
    if (this.props.viewMode || !this.props.supportsRecurrence) return;
    if (document.querySelector('.oh-overlay')) return;
    if (e.key === 's' && (IS_MAC ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      if (this.isValid()) this.updateValue();
    }
  };

  onSelect = (active) => {
    const newState = { active };
    if (active === IS_247_ACTIVE) {
      newState.hours = DAYS.map(weekday => ({
        opensAt: MIDNIGHT,
        closesAt: ELEVEN_FIFTY_NINE,
        weekday,
      }));
    }
    if (active === IS_NOT_247_ACTIVE && !this.props.supportsRecurrence &&
      !this.state.schedule.atoms.length) {
      newState.schedule = { ...this.state.schedule, atoms: addCard([]) };
    }
    if (active === IS_CLOSED) {
      newState.hours = [{
        closed: true,
      }];
    }
    if (active === NOTHING_ACTIVE) {
      newState.hours = [];
    }
    this.setState(newState);
  }

  onWeekday = (index) => {
    const { weekdaysOpen, hours } = this.state;
    const value = weekdaysOpen[index];
    const dayString = DAYS[index];

    const hoursForDay = hours.filter(row => row.weekday === dayString);
    if (!value && (!hoursForDay || !hoursForDay.length)) {
      this.addHour(dayString); // add a row to the clicked weekday, if he is empty
    }

    this.setState({ weekdaysOpen: { ...weekdaysOpen, [index]: !value } });
  };

  onChange = (field, hour, newValue) => {
    const idx = this.state.hours.indexOf(hour);
    const newHoursAtIdx = {
      ...this.state.hours[idx],
      [field]: newValue,
    };

    this.setState({
      hours: [
        ...this.state.hours.slice(0, idx),
        newHoursAtIdx,
        ...this.state.hours.slice(idx + 1),
      ],
      latestHoursEntered: newHoursAtIdx,
    });
  }

  onScheduleChange = (field, value) => this.setState(({ schedule }) => ({
    schedule: { ...schedule, [field]: value },
  }));

  // Applies `operation` from recurrence.js to the atoms behind `card`.
  onEditCard = card => (operation, ...args) => this.onScheduleChange(
    'atoms',
    operation(this.state.schedule.atoms, card, ...args),
  );

  onAtoms = change => this.onScheduleChange('atoms', change(this.state.schedule.atoms));

  // Fills the whole week: Mon–Fri 9–5 and the weekend closed, or every day closed.
  onQuickFill = weekdaysOpen => this.onAtoms(atoms => fillWeek(
    atoms,
    weekdaysOpen ? DAYS.slice(0, 5) : [],
    [{ opensAt: '09:00', closesAt: '17:00', description: '' }],
  ));

  // Opens the holidays and exceptions dialog on a date picked in the calendar.
  onAddSpecialHours = date => this.setState({ exceptionDate: date });

  onExceptionDateHandled = () => this.setState({ exceptionDate: null });

  onExceptions = changes => this.setState(({ schedule }) => ({
    schedule: { ...schedule, ...changes },
  }));

  // Applies an operation to the drawer's card. The cards regroup afterwards, so the drawer
  // follows the atoms the operation leaves on that card; if it leaves none, the drawer closes.
  // `pick` narrows which of them to follow.
  onDrawerEdit = (operation, ...args) => this.editDrawerCard(atoms => atoms, operation, ...args);

  onDrawerSplit = date => this.editDrawerCard(
    atoms => atoms.filter(atom => atom.validFrom === date),
    splitCard,
    date,
  );

  onSkipCardDate = (card, action, date) =>
    this.onEditCard(card)(action === 'skip' ? skipCardDate : unskipCardDate, date);

  onSkipClosure = (index, date, skipped) => this.onScheduleChange(
    'closures',
    this.state.schedule.closures.map((closure, i) => {
      if (i !== index) return closure;
      const exdates = skipped
        ? closure.exdates.filter(d => d !== date)
        : [...closure.exdates, date].sort();
      return { ...closure, exdates };
    }),
  );

  // The schedule in the selected mode: 24/7 is open all day, every day.
  getSchedule = () => (this.state.active === IS_247_ACTIVE
    ? { ...this.state.schedule, atoms: ALL_DAY_ATOMS }
    : this.state.schedule);

  getHoursToSave = () => {
    const { active } = this.state;
    if (!this.props.supportsRecurrence || (active !== IS_NOT_247_ACTIVE && active !== IS_247_ACTIVE)) {
      return splitOvernightHours(this.state.hours);
    }
    // Overnight hours stay one row: the occurrence belongs to the day it starts on.
    return applySchedule(this.getSchedule());
  };

  updateValue = e => this.props.updateValue(
    this.getHoursToSave(),
    this.props.id,
    this.props.metaDataSection,
    this.props.fieldName,
  );

  openDrawer = (card, opener) => this.setState(({ schedule }) => ({
    drawer: { tracked: card.atoms, snapshot: schedule.atoms, opener },
  }));

  // A new card with no days yet, opened in the drawer; Cancel takes it away again.
  addPattern = (e) => {
    const opener = e.currentTarget;
    const { atoms } = this.state.schedule;
    const added = addCard(atoms);
    this.setState(({ schedule }) => ({
      schedule: { ...schedule, atoms: added },
      drawer: { tracked: added.filter(atom => !atoms.includes(atom)), snapshot: atoms, opener },
    }));
  };

  // The drawer's card is only the atoms it tracks: opened from a day's row, that's the one day,
  // even while other days share its hours and settings.
  drawerCard = () => {
    const { drawer, schedule } = this.state;
    return drawer &&
      groupAtoms(schedule.atoms.filter(atom => drawer.tracked.includes(atom)))[0];
  };

  editDrawerCard(pick, operation, ...args) {
    const card = this.drawerCard();
    if (!card) return;
    const { schedule, drawer } = this.state;
    const atoms = operation(schedule.atoms, card, ...args);
    const edited = new Set(pick(operation(card.atoms, card, ...args)).map(atomKey));
    const tracked = atoms.filter(atom => edited.has(atomKey(atom)));
    if (!tracked.length) {
      this.setState({ schedule: { ...schedule, atoms } }, this.closeDrawer);
      return;
    }
    this.setState({ schedule: { ...schedule, atoms }, drawer: { ...drawer, tracked } });
  }

  closeDrawer = () => {
    const { opener } = this.state.drawer;
    this.setState({ drawer: null }, () => opener && opener.isConnected && opener.focus());
  };

  cancelDrawer = () => this.setState(
    ({ schedule, drawer }) => ({ schedule: { ...schedule, atoms: drawer.snapshot } }),
    this.closeDrawer,
  );

  addHour = (day) => {
    const latest = this.state.latestHoursEntered;
    // Reuse the last times entered, but not their note, which is about that day.
    const defaultHours = latest
      ? { opensAt: latest.opensAt, closesAt: latest.closesAt }
      : { opensAt: null, closesAt: null };

    this.setState({
      hours: [
        ...this.state.hours,
        { ...defaultHours, weekday: day },
      ],
    });
  }

  removeHour = (hour) => {
    const { hours, weekdaysOpen } = this.state;
    const idx = hours.indexOf(hour);
    const thisDayshours = hours.filter(time => time.weekday === hour.weekday);
    this.setState({
      weekdaysOpen: {
        ...weekdaysOpen,
        [DAYS.indexOf(hour.weekday)]: (thisDayshours.length - 1) > 0,
      },
      hours: [
        ...hours.slice(0, idx),
        ...hours.slice(idx + 1),
      ],
    });
  }

  isValid() {
    const { active, hours } = this.state;
    if (!this.props.supportsRecurrence) return checkAllHoursValid(hours);
    const schedule = this.getSchedule();
    const cards = groupAtoms(schedule.atoms);
    return (active !== IS_NOT_247_ACTIVE || cards.length + schedule.closures.length +
      schedule.specialHours.length > 0) &&
      !cards.some(getCardError) &&
      !schedule.closures.some(getClosureError) &&
      schedule.specialHours.every(isSpecialHoursValid) &&
      !describeConflicts(schedule).length;
  }

  // How many things stop the hours being saved, for the save bar.
  countProblems() {
    const { active } = this.state;
    if (active === NOTHING_ACTIVE) return 1;
    if (active === IS_CLOSED) return 0;
    const schedule = this.getSchedule();
    const cards = groupAtoms(schedule.atoms);
    const isEmpty = active === IS_NOT_247_ACTIVE &&
      !cards.length && !schedule.closures.length && !schedule.specialHours.length;
    return (isEmpty ? 1 : 0) +
      cards.filter(getCardError).length +
      schedule.closures.filter(getClosureError).length +
      schedule.specialHours.filter(entry => !isSpecialHoursValid(entry)).length +
      describeConflicts(schedule).length;
  }

  // Repeating hours, described, for view mode.
  renderSeries() {
    const cards = groupAtoms(this.state.schedule.atoms);
    return (
      <div className="mb-3">
        {cards.map(card => <div key={cardKey(card)}>{describeCard(card)}</div>)}
      </div>
    );
  }

  // The legacy weekday grid, for the regular hours field.
  renderWeekdays() {
    const { weekdaysOpen, hours } = this.state;

    return (
      <div className="mb-3">
        {
          !this.props.viewMode &&
            <p> Select the days and times this service is available </p>
        }
        <Selector fluid>
          {
            DAYS.map((day, i) => {
              const dayHours = hours.filter(time => time.weekday === day);
              return [
                <Selector.Option
                  key={`selector-${day}`}
                  disablePadding={weekdaysOpen[i]}
                  active={!!dayHours.length}
                  hide={this.props.viewMode && !dayHours.length}
                  onClick={this.props.viewMode ? undefined : () => this.onWeekday(i)}
                >
                  <div>{day}</div>
                  {dayHours.some(hour => !hour.opensAt || !hour.closesAt) && (
                    <div style={{ fontSize: '.8em' }}>
                      Please enter From & To hours
                    </div>
                  )}
                  <div style={{ fontSize: '.8em' }}>
                    {
                      dayHours
                        .sort((a, b) => a.opensAt < b.openAt)
                        .map(formatHours)
                        .join(' | ')
                    }
                  </div>
                </Selector.Option>,
              ].concat(dayHours && dayHours.length ?
                <OpeningHoursEditForm
                  startTabIndex={i}
                  key={`editForm-${day}`}
                  active={weekdaysOpen[i]}
                  hours={dayHours}
                  onFromChange={this.onChange}
                  onToChange={this.onChange}
                  removeHour={this.removeHour}
                  addHour={() => this.addHour(day)}
                  viewMode={this.props.viewMode}
                /> : []);
            })
          }
        </Selector>
      </div>
    );
  }

  renderSaveBar() {
    const valid = this.isValid();
    const problems = valid ? 0 : Math.max(1, this.countProblems());
    const dirty = JSON.stringify(this.getHoursToSave()) !== this.savedHours;
    let status = 'No changes yet';
    if (!valid) status = `! ${problems} thing${problems === 1 ? '' : 's'} to fix before saving`;
    else if (dirty) status = 'Unsaved changes';
    if (this.state.active === NOTHING_ACTIVE) status = 'Pick Closed, Open 24/7 or Set hours';

    return (
      <div className={`oh-savebar${valid ? '' : ' is-invalid'}`}>
        {dirty && valid && <span className="oh-dot" aria-hidden="true" />}
        <span className="oh-savebar-status" role="status">{status}</span>
        {!valid && this.state.active !== NOTHING_ACTIVE && (
          <button
            type="button"
            className="oh-link"
            onClick={() => focusFirstProblem(this.editor.current)}
          >
            Show me
          </button>
        )}
        <span className="oh-flex" />
        <span className="oh-help oh-hide-narrow">
          <kbd className="oh-kbd">{IS_MAC ? '⌘' : 'Ctrl'}</kbd>{' '}
          <kbd className="oh-kbd">S</kbd> to save
        </span>
        <button type="button" className="oh-btn" onClick={this.props.onCancel}>Cancel</button>
        <button
          type="button"
          className="oh-btn oh-primary oh-wide"
          disabled={!valid}
          onClick={this.updateValue}
        >
          Save hours
        </button>
      </div>
    );
  }

  // The editor for calendar-style schedules: a week table with the calendar beside it.
  renderEditor() {
    const { active, schedule, exceptionDate } = this.state;
    const showsCalendar = active === IS_NOT_247_ACTIVE || active === IS_247_ACTIVE;
    const cards = groupAtoms(schedule.atoms);
    const conflicts = showsCalendar ? describeConflicts(this.getSchedule()) : [];
    const drawerCard = this.drawerCard();

    return (
      <div className="oh-editor w-100" ref={this.editor}>
        <div className="oh-head">
          <h1>When is this service available?</h1>
          <Segmented
            label="Service status"
            value={active}
            options={STATUS_OPTIONS}
            onChange={value => this.onSelect(value === active ? NOTHING_ACTIVE : value)}
          />
        </div>
        {showsCalendar && (
          <div className="oh-summary" role="status">
            <span className="oh-th">Summary</span>
            <span>{describeSchedule(this.getSchedule())}</span>
          </div>
        )}
        {active === IS_CLOSED && (
          <p className="oh-help">This service is closed. Its hours won&apos;t show to clients.</p>
        )}

        <div className={showsCalendar ? 'oh-layout' : ''}>
          <div className="oh-main">
            {active === IS_NOT_247_ACTIVE && (
              <section className="oh-section" aria-labelledby="oh-weekly">
                <div className="oh-section-head">
                  <h2 id="oh-weekly">Weekly hours</h2>
                  <div className="oh-inline">
                    <span className="oh-help">Quick fill</span>
                    {[
                      ['Weekdays 9–5', () => this.onQuickFill(true)],
                      ['All closed', () => this.onQuickFill(false)],
                      ['24/7', () => this.onSelect(IS_247_ACTIVE)],
                    ].map(([label, onClick]) => (
                      <button key={label} type="button" className="oh-pill" onClick={onClick}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="oh-help">
                  Pick a time or type it. <kbd className="oh-kbd">Tab</kbd> moves to the next field.
                </span>
                <WeekTable cards={cards} onAtoms={this.onAtoms} onOpenCard={this.openDrawer} />
                <div className="oh-inline">
                  <button type="button" className="oh-btn" onClick={this.addPattern}>
                    + Add hours on another pattern
                  </button>
                  <span className="oh-help">
                    For example every other week, or the 1st Saturday of the month.
                  </span>
                </div>
              </section>
            )}
            {active === IS_247_ACTIVE && (
              <p className="oh-help">
                Open all day, every day. Holidays and exceptions still apply.
              </p>
            )}
            {showsCalendar && (
              <ExceptionsEdit
                closures={schedule.closures}
                specialHours={schedule.specialHours}
                onChange={this.onExceptions}
                requestedDate={exceptionDate}
                onRequestHandled={this.onExceptionDateHandled}
              />
            )}
            {conflicts.map(conflict => (
              <div key={conflict} role="alert" className="oh-warning oh-error" tabIndex={-1}>
                <strong>!</strong> {conflict}
              </div>
            ))}
          </div>
          {showsCalendar && (
            <aside className="oh-side" aria-label="Calendar preview">
              <SchedulePreview
                schedule={this.getSchedule()}
                onEditCard={active === IS_247_ACTIVE ? () => {} : this.onSkipCardDate}
                onSkipClosure={this.onSkipClosure}
                onAddSpecialHours={this.onAddSpecialHours}
              />
            </aside>
          )}
        </div>

        {this.renderSaveBar()}

        {drawerCard && (
          <PatternDrawer
            card={drawerCard}
            today={nyToday()}
            onEdit={this.onDrawerEdit}
            onSplit={this.onDrawerSplit}
            onDone={this.closeDrawer}
            onCancel={this.cancelDrawer}
          />
        )}
      </div>
    );
  }

  render() {
    const { active, schedule } = this.state;
    const { supportsRecurrence, viewMode } = this.props;
    if (supportsRecurrence && !viewMode) return this.renderEditor();

    const showsCalendar = supportsRecurrence &&
      (active === IS_NOT_247_ACTIVE || active === IS_247_ACTIVE);
    const allHoursValid = this.isValid();
    const conflicts = showsCalendar && !viewMode ? describeConflicts(this.getSchedule()) : [];

    return (
      <div className="w-100">
        {
          !this.props.viewMode &&
            <Header className="mb-3">When is this service available?</Header>
        }
        <Selector fluid>
          <Selector.Option
            hide={this.props.viewMode && active !== IS_CLOSED}
            active={active === IS_CLOSED}
            onClick={this.props.viewMode ? undefined : () => this.onSelect(active === IS_CLOSED ? NOTHING_ACTIVE : IS_CLOSED)}
          >
            This service is <strong>closed</strong>
          </Selector.Option>
          <Selector.Option
            hide={this.props.viewMode && active !== IS_247_ACTIVE}
            active={active === IS_247_ACTIVE}
            onClick={this.props.viewMode ? undefined : () => this.onSelect(active === IS_247_ACTIVE ? NOTHING_ACTIVE : IS_247_ACTIVE)}
          >
            This service is 24/7
          </Selector.Option>
          <Selector.Option
            hide={this.props.viewMode}
            active={active === IS_NOT_247_ACTIVE}
            onClick={this.props.viewMode ? undefined : () => this.onSelect(active === IS_NOT_247_ACTIVE ? NOTHING_ACTIVE : IS_NOT_247_ACTIVE)}
          >
            This service is <strong>not</strong> 24/7
          </Selector.Option>
        </Selector>
        {active === IS_NOT_247_ACTIVE &&
          (supportsRecurrence ? this.renderSeries() : this.renderWeekdays())}
        {showsCalendar && (
          <ExceptionsView closures={schedule.closures} specialHours={schedule.specialHours} />
        )}
        {showsCalendar && (
          <SchedulePreview
            schedule={this.getSchedule()}
            viewMode={viewMode}
            onEditCard={active === IS_247_ACTIVE ? () => {} : this.onSkipCardDate}
            onSkipClosure={this.onSkipClosure}
          />
        )}
        {showsCalendar && !viewMode && conflicts.map(conflict => (
          <div key={conflict} style={ERROR_STYLE}>{conflict}</div>
        ))}
        {
          !this.props.viewMode && (
            <div>
              {!allHoursValid && (
                <div style={{ color: '#A02733', fontSize: '0.8em' }}>
                  {supportsRecurrence
                    ? 'Please fix the hours or special hours above'
                    : 'Missing hours for some selected days'}
                </div>
              )}
              <Button
                onClick={this.updateValue}
                primary
                disabled={!allHoursValid}
              >
                OK
              </Button>&nbsp;
              <Button onClick={this.props.onCancel} basic primary>
                CANCEL
              </Button>
            </div>
          )
        }
      </div>
    );
  }
}

export default ServiceOpeningHours;
