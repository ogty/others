export interface LatitudeLongitude {
  latitude: number;
  longitude: number;
}

export class LocationRelatedCalculators {
  latitude: number;

  longitude: number;

  radialLatitude: number;

  radialLongitude: number;

  R: number = Math.PI / 180;

  constructor({ latitude, longitude }: LatitudeLongitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.radialLatitude = this.latitude * this.R;
    this.radialLongitude = this.longitude * this.R;
  }

  distance() {
    return ({ latitude, longitude }: LatitudeLongitude) => {
      const radialLatitude = latitude * this.R;
      const radialLongitude = longitude * this.R;
      const distance =
        6371 *
        Math.acos(
          Math.cos(this.radialLatitude) *
            Math.cos(radialLatitude) *
            Math.cos(radialLongitude - this.radialLongitude) +
            Math.sin(this.radialLatitude) * Math.sin(radialLatitude),
        );
      return distance;
    };
  }

  direction() {
    return ({ latitude, longitude }: LatitudeLongitude) => {
      const yAxis =
        Math.cos((longitude * this.R) / 180) *
        Math.sin((latitude * this.R) / 180 - this.radialLatitude);
      const xAxis =
        Math.cos((this.radialLongitude * this.R) / 180) * Math.sin((longitude * this.R) / 180) -
        Math.sin((this.radialLongitude * this.R) / 180) *
          Math.cos((longitude * this.R) / 180) *
          Math.cos((latitude * this.R) / 180 - this.radialLatitude);
      let directionZeroDegreesEastward = (180 * Math.atan2(xAxis, yAxis)) / this.R;
      if (directionZeroDegreesEastward < 0) {
        directionZeroDegreesEastward += 360;
      }
      const directionZeroDegreesNorth = (directionZeroDegreesEastward + 90) % 360;
      return directionZeroDegreesNorth;
    };
  }
}

declare const currentLatitude: number;
declare const currentLongitude: number;

interface Position {
  coords: {
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    latitude: number;
    longitude: number;
    speed: number | null;
  };
  timestamp: number;
}

function getCurrentPosition(): LatitudeLongitude {
  const setCurrentPosition = (position: Position) => {
    (window as any).latitude = position.coords.latitude;
    (window as any).longitude = position.coords.longitude;
  };
  navigator.geolocation.getCurrentPosition(setCurrentPosition);
  return { latitude: currentLatitude, longitude: currentLongitude };
}

const currentPosition = getCurrentPosition();
const osaka: LatitudeLongitude = {
  latitude: 34.68639,
  longitude: 135.52,
};

const directionString = (numericAngle: number) => {
  const optimalAngle = 45 * Math.round(numericAngle / 45);
  const azimuthalCorrespondenceTable: { [name: number]: string } = {
    0: 'N',
    45: 'NE',
    90: 'E',
    135: 'SE',
    180: 'S',
    225: 'SW',
    270: 'W',
    315: 'NW',
  };
  return azimuthalCorrespondenceTable[optimalAngle];
};

const locationRelatedCalculators = new LocationRelatedCalculators(currentPosition);
const distanceCalculator = locationRelatedCalculators.distance();
const directionCalculator = locationRelatedCalculators.direction();
const distance = distanceCalculator(osaka);
const numericAngle = directionCalculator(osaka);

console.log(`${Math.round(distance)}km`);
console.log(`${Math.round(numericAngle)}\u00B0 ${directionString(numericAngle)}`);
