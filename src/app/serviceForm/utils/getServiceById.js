export default function getServiceById(location, serviceId) {
  try {
    return location.Services.filter(service => service.id === serviceId)[0];
  } catch (error) {
    // eslint-disable-next-line no-console
    return console.error("This service doesn't exist for this location");
  }
}
