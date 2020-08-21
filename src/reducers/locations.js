import {
  GET_LOCATION_RESPONSE,
  GET_TAXONOMY_RESPONSE,
  OPTIMISTIC_UPDATE_LOCATION,
  ROLLBACK_UPDATE_LOCATION,
  OPTIMISTIC_UPDATE_PHONE,
  OPTIMISTIC_CREATE_PHONE,
  CREATE_PHONE_SUCCESS,
  OPTIMISTIC_UPDATE_ORGANIZATION,
  OPTIMISTIC_UPDATE_SERVICE,
  OPTIMISTIC_DELETE_PHONE,
} from '../actions';
import { DAYS } from '../Constants';

function constructUpdatedMetadata(location, metaDataSection, fieldName, dateString) {
  const { metadata } = location;
  const subFields = metadata[metaDataSection] || [];
  const newField = { field_name: fieldName, last_action_date: dateString };
  const fieldIndex = subFields ? subFields.findIndex(field => field.field_name === fieldName) : -1;
  const newSubFields =
    fieldIndex > -1
      ? [...subFields.slice(0, fieldIndex), newField, ...subFields.slice(fieldIndex + 1)]
      : subFields.concat(newField);

  return {
    ...metadata,
    [metaDataSection]: newSubFields,
  };
}

function constructNewStateWithUpdatedPhones(state, action, newPhones, location, dateString) {
  const { metaDataSection, fieldName, locationId } = action.payload;
  return {
    ...state,
    [`last/${locationId}`]: state[locationId],
    [locationId]: {
      ...state[locationId],
      Phones: newPhones,
      metadata: constructUpdatedMetadata(location, metaDataSection, fieldName, dateString),
    },
  };
}

const locationsReducer = (state = {}, action) => {
  const dateString = new Date().toISOString();
  switch (action.type) {
    case GET_LOCATION_RESPONSE:
      if (action.payload) {
        const originalLocationId = `original/${action.payload.id}`;
        return {
          ...state,
          // tag initial download of location data so that we can use it for "session" logic
          [originalLocationId]: state[originalLocationId] || action.payload,
          [action.payload.id]: action.payload,
        };
      }
      break;
    case GET_TAXONOMY_RESPONSE:
      return action.payload ? { ...state, taxonomy: [...action.payload] } : state;
    case OPTIMISTIC_UPDATE_SERVICE:
      if (action.payload) {
        const {
          metaDataSection, fieldName, locationId, params, serviceId,
        } = action.payload;
        const {
          documents = {},
          membership,
          eventRelatedInfo,
          area,
        } = params;
        const location = state[locationId];
        const { Services } = location;
        const serviceIdx = Services.findIndex(service => service.id === serviceId);
        const service = location.Services[serviceIdx];
        const {
          Languages,
          DocumentsInfo,
          RegularSchedules,
          HolidaySchedules,
          EventRelatedInfos,
          ServiceTaxonomySpecificAttributes = [],
          ServiceAreas = [],
          Eligibilities = [],
        } = service;

        let { RequiredDocuments } = service;

        if (documents.proofs != null) {
          RequiredDocuments = documents.proofs.map(p => ({ document: p }));
        }

        if (area != null) {
          ServiceAreas[0] = {
            ...area,
            updated_at: dateString,
          };
        }

        if (membership) {
          const membershipEl = Eligibilities
            .find(e => e.EligibilityParameter.name === 'membership');

          if (membershipEl) {
            membershipEl.eligible_values = membership.eligible_values;
            membershipEl.description = membership.description;
            membershipEl.updated_at = dateString;
          } else {
            Eligibilities.push({
              eligible_values: membership.eligible_values,
              description: membership.description,
              updated_at: dateString,
              EligibilityParameter: {
                name: 'membership',
              },
            });
          }
        }

        const taxonomySpecificAttributes = [
          'hasHivNutrition',
          'tgncClothing',
          'clothingOccasion',
          'wearerAge',
        ];

        taxonomySpecificAttributes.forEach((attr) => {
          if (Object.prototype.hasOwnProperty.call(params, attr)) {
            const fieldIdx = ServiceTaxonomySpecificAttributes
              .findIndex(el => el.attribute.name === attr);

            if (fieldIdx !== -1) {
              ServiceTaxonomySpecificAttributes[fieldIdx].values = params[attr];
              ServiceTaxonomySpecificAttributes[fieldIdx].updated_at = dateString;
            } else {
              ServiceTaxonomySpecificAttributes.push({
                values: params[attr],
                updated_at: dateString,
                attribute: {
                  name: attr,
                },
              });
            }
          }
        });

        let hours = null;
        if (params.hours) {
          hours = params.hours.map(({ opensAt, closesAt, weekday }) => ({
            opens_at: `${opensAt}:00`,
            closes_at: `${closesAt}:00`,
            weekday: DAYS.indexOf(weekday) + 1,
          }));
        }
        let irregularHours = null;
        if (params.irregularHours) {
          irregularHours = params.irregularHours.map(({
            opensAt,
            closesAt,
            weekday,
            ...otherProps
          }) => ({
            ...otherProps,
            opens_at: `${opensAt}:00`,
            closes_at: `${closesAt}:00`,
            weekday: DAYS.indexOf(weekday) + 1,
          }));
        }
        return {
          ...state,
          [`last/${locationId}`]: location,
          [locationId]: {
            ...location,
            Services: [
              ...Services.slice(0, serviceIdx),
              {
                ...service,
                ...params,
                // API params mapped to data field names
                ages_served: params.agesServed || service.ages_served,
                who_does_it_serve: params.whoDoesItServe || service.who_does_it_serve,
                additional_info: params.additionalInfo || service.additional_info,
                metadata: constructUpdatedMetadata(service, metaDataSection, fieldName, dateString),
                Languages: params.languages || Languages,
                DocumentsInfo: {
                  recertification_time: documents.recertificationTime ||
                    (DocumentsInfo && DocumentsInfo.recertification_time),
                  grace_period: documents.gracePeriod ||
                    (DocumentsInfo && DocumentsInfo.grace_period),
                  additional_info: documents.additionalInfo ||
                    (DocumentsInfo && DocumentsInfo.additional_info),
                },
                RequiredDocuments,
                RegularSchedules: hours || RegularSchedules,
                HolidaySchedules: irregularHours || HolidaySchedules,
                EventRelatedInfos: eventRelatedInfo ? [eventRelatedInfo] : EventRelatedInfos,
                ServiceTaxonomySpecificAttributes,
                ServiceAreas,
                Eligibilities,
              },
              ...Services.slice(serviceIdx + 1),
            ],
          },
        };
      }
      break;
    case OPTIMISTIC_UPDATE_ORGANIZATION:
      if (action.payload) {
        const {
          metaDataSection, fieldName, locationId, params,
        } = action.payload;
        const location = state[locationId];
        const organization = location.Organization;
        return {
          ...state,
          [`last/${locationId}`]: state[locationId],
          [locationId]: {
            ...state[locationId],
            Organization: {
              ...organization,
              ...params,
            },
            metadata: constructUpdatedMetadata(location, metaDataSection, fieldName, dateString),
          },
        };
      }
      break;
    case OPTIMISTIC_UPDATE_LOCATION:
      if (action.payload) {
        const {
          id, params, metaDataSection, fieldName,
        } = action.payload;
        const location = state[id];
        return {
          ...state,
          [`last/${id}`]: location,
          [id]: {
            ...location,
            ...params,
            EventRelatedInfos: [params.eventRelatedInfo] || location.EventRelatedInfos,
            metadata: constructUpdatedMetadata(location, metaDataSection, fieldName, dateString),
          },
        };
      }
      break;
    case ROLLBACK_UPDATE_LOCATION:
      if (action.payload) {
        return {
          ...state,
          [`last/${action.payload.id}`]: null,
          [action.payload.id]: state[`last/${action.payload.id}`],
        };
      }
      break;
    case OPTIMISTIC_UPDATE_PHONE: {
      const location = state[action.payload.locationId];
      const idx = location.Phones.findIndex(phone => phone.id === action.payload.phoneId);
      const phone = location.Phones[idx];
      const newPhones = [
        ...location.Phones.slice(0, idx),
        { ...phone, ...action.payload.params },
        ...location.Phones.slice(idx + 1),
      ];
      return constructNewStateWithUpdatedPhones(state, action, newPhones, location, dateString);
    }
    case OPTIMISTIC_CREATE_PHONE: {
      const location = state[action.payload.locationId];
      let newPhones;
      if (!location.Phones) {
        newPhones = [action.payload.params];
      } else {
        newPhones = [...location.Phones, action.payload.params];
      }
      return constructNewStateWithUpdatedPhones(state, action, newPhones, location, dateString);
    }
    case OPTIMISTIC_DELETE_PHONE: {
      const location = state[action.payload.locationId];
      const newPhones = location.Phones.filter(p => p.id !== action.payload.phoneId);
      return constructNewStateWithUpdatedPhones(state, action, newPhones, location, dateString);
    }
    case CREATE_PHONE_SUCCESS: {
      const location = state[action.payload.locationId];

      const idx = location.Phones.findIndex(phone =>
        !phone.id &&
          phone.number === action.payload.params.number &&
          phone.extension === action.payload.params.extension);
      const phone = location.Phones[idx];

      const newPhones = [
        ...location.Phones.slice(0, idx),
        { ...phone, ...action.payload.params },
        ...location.Phones.slice(idx + 1),
      ];
      return constructNewStateWithUpdatedPhones(state, action, newPhones, location, dateString);
    }
    default:
      return state;
  }

  return state;
};

export default locationsReducer;
