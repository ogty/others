interface LocationOfUsersAddress {
    latitude: number;
    longitude: number;
}
  
function distanceCalculator(
    latitudeX: number,
    longitudeX: number,
): (latitudeY: number, longitudeY: number) => number {
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

// Call from another file...
// Example: import { distanceCalculatorFromHome } from './distanceCalculatorFromHome';
// Example: Osaka
const usersCurrentLatitude = 34.68639;
const usersCurrentLongitude = 135.52;
const distanceFromHome = distanceCalculatorFromHome(usersCurrentLatitude, usersCurrentLongitude);
console.log(`${Math.round(distanceFromHome)}km`);

// --------------------------------------------------
const numberOfTimesRepeated = 10;
const pattern1 = ((f, n) => {
    return f(f, n);
})((sum: any, n: number) => {
    return n === 1 ? 1 : n + sum(sum, n - 1);
}, numberOfTimesRepeated);
console.log(pattern1); // 55

const pattern2 = ((f) => {
    return (n: number) => {
        return f(f, n);
    };
})((sum: any, n: number) => {
    return n === 1 ? 1 : n + sum(sum, n - 1);
});
console.log(pattern2(numberOfTimesRepeated)); // 55

// --------------------------------------------------
interface WrapperObject {
    value: number;
}

function bind(w: WrapperObject, f: (v: number) => WrapperObject): WrapperObject {
    const v = w.value;
    const rw = f(v);
    return rw;
}
function unit(v: number): WrapperObject {
    return { value: v };
}
function inc(v: number): WrapperObject {
    return unit(v + 1);
}
function double(v: number): WrapperObject {
    return unit(v * 2);
}

const wrapper1 = unit(1);
const wrapper2 = bind(wrapper1, inc);
const wrapper3 = bind(wrapper2, double);
console.log(wrapper3); // { value: 4 }
