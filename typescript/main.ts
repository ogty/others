interface LocationOfUsersAddress {
    latitude: number;
    longitude: number;
}
  
function distanceCalculator(latitudeX: number, longitudeX: number): any {
    const R = Math.PI / 180;
    const lat1 = latitudeX * R;
    const lon1 = longitudeX * R;
  
    return (latitudeY: number, longitudeY: number) => {
        const lat2 = latitudeY * R;
        const lon2 = longitudeY * R;
        const d =
            6371 *
            Math.acos(
            Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1) + Math.sin(lat1) * Math.sin(lat2),
        );
        return d;
    };
  }
  
// Example: Tokyo
const UserLocation: LocationOfUsersAddress = {
    latitude: 35.68944,
    longitude: 139.69167,
};
export const distanceCalculatorFromHome = distanceCalculator(
    UserLocation.latitude,
    UserLocation.longitude,
);

// Call from another file
// Example: import { distanceCalculatorFromHome } from './distanceCalculatorFromHome';
// Example: Osaka
const usersCurrentLatitude = 34.68639;
const usersCurrentLongitude = 135.52;
const distanceFromHome = distanceCalculatorFromHome(usersCurrentLatitude, usersCurrentLongitude);
console.log(`${Math.round(distanceFromHome)}km`);
