let geocoder = null;

export const getAddressForLocation = location => new Promise((resolve, reject) => {
  if (!geocoder) {
    geocoder = new window.google.maps.Geocoder();
  }

  geocoder.geocode({ location }, (results, status) => {
    try {
      if (status !== 'OK') {
        throw new Error('No address found at clicked position');
      }

      const addresses = results.filter(result => result.types.indexOf('street_address') !== -1);

      if (!addresses.length) {
        throw new Error('No street address at clicked position');
      }

      const address = addresses[0];

      const getAddressComponent = (type) => {
        const matchingComponents =
          address.address_components.filter(component => component.types.indexOf(type) !== -1);

        if (!matchingComponents.length) {
          throw new Error(`No "${type}" address component`);
        }

        return matchingComponents[0].short_name;
      };

      const formattedAddress = address.formatted_address;
      const [street, city] = formattedAddress.split(',');

      resolve({
        street: street.trim(),
        city: city.trim(),
        state: getAddressComponent('administrative_area_level_1'),
        postalCode: getAddressComponent('postal_code'),
        country: getAddressComponent('country'),
        formattedAddress,
      });
    } catch (err) { reject(err); }
  });
});

export default { getAddressForLocation };
