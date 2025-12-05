/**
 * Qibla Service
 * Accurate Qibla direction calculation and compass heading management
 */

import * as Location from 'expo-location';
import { Magnetometer, DeviceMotion } from 'expo-sensors';
import { Platform } from 'react-native';

// Kaaba coordinates
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

interface CompassData {
  heading: number;           // Device heading in degrees (0-360)
  accuracy: number;          // Heading accuracy
  qiblaDirection: number;    // Qibla bearing from north
  qiblaHeading: number;      // Relative Qibla direction from device
  distance: number;          // Distance to Kaaba in km
  isAligned: boolean;        // Whether device is aligned with Qibla
}

interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export class QiblaService {
  private static magnetometerSubscription: any = null;
  private static deviceMotionSubscription: any = null;
  private static currentLocation: LocationData | null = null;
  private static magneticDeclination: number = 0;
  private static calibrationOffset: number = 0;

  /**
   * Calculate Qibla direction from a given location
   * Returns bearing in degrees from true north (0-360)
   */
  static calculateQiblaDirection(latitude: number, longitude: number): number {
    // Convert to radians
    const lat1 = this.toRadians(latitude);
    const lat2 = this.toRadians(KAABA_LATITUDE);
    const lon1 = this.toRadians(longitude);
    const lon2 = this.toRadians(KAABA_LONGITUDE);

    // Calculate the difference in longitude
    const dLon = lon2 - lon1;

    // Calculate bearing using forward azimuth formula
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    // Calculate bearing in radians
    const bearingRad = Math.atan2(y, x);

    // Convert to degrees and normalize to 0-360
    let bearing = this.toDegrees(bearingRad);
    bearing = (bearing + 360) % 360;

    return bearing;
  }

  /**
   * Calculate distance to Kaaba using Haversine formula
   * Returns distance in kilometers
   */
  static calculateDistanceToKaaba(latitude: number, longitude: number): number {
    const R = 6371; // Earth's radius in km

    const lat1 = this.toRadians(latitude);
    const lat2 = this.toRadians(KAABA_LATITUDE);
    const dLat = this.toRadians(KAABA_LATITUDE - latitude);
    const dLon = this.toRadians(KAABA_LONGITUDE - longitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
  }

  /**
   * Get device heading from magnetometer
   * Returns heading in degrees from magnetic north
   */
  static async getDeviceHeading(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'ios') {
        // On iOS, use Location.getHeadingAsync for more accurate results
        Location.watchHeadingAsync(
          (heading) => {
            // iOS provides true heading directly
            const trueHeading = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
            resolve(trueHeading);
          }
        ).catch(reject);
      } else {
        // On Android, calculate from magnetometer
        Magnetometer.addListener((data) => {
          const heading = this.calculateHeadingFromMagnetometer(data);
          resolve(heading);
        });
      }
    });
  }

  /**
   * Calculate heading from raw magnetometer data
   * Properly accounts for device orientation
   */
  private static calculateHeadingFromMagnetometer(data: any): number {
    let heading: number;

    if (Platform.OS === 'android') {
      // Android magnetometer calculation
      // Account for device orientation
      const { x, y, z } = data;

      // Calculate heading using atan2
      // Android uses a different coordinate system
      // X axis is horizontal and points to the right
      // Y axis is horizontal and points to the north
      // Z axis points towards the sky
      heading = Math.atan2(-x, y);

      // Convert to degrees
      heading = this.toDegrees(heading);

      // Normalize to 0-360
      heading = (heading + 360) % 360;

      // Apply calibration offset
      heading = (heading + this.calibrationOffset) % 360;
    } else {
      // iOS calculation (fallback if not using Location API)
      const { x, y } = data;
      // iOS coordinate system
      heading = Math.atan2(y, x);
      heading = this.toDegrees(heading);
      heading = (450 - heading) % 360; // iOS coordinate system adjustment
    }

    // Apply magnetic declination to get true heading
    heading = (heading + this.magneticDeclination + 360) % 360;

    return heading;
  }

  /**
   * Get magnetic declination for a location
   * This is the difference between magnetic north and true north
   */
  static async getMagneticDeclination(latitude: number, longitude: number): Promise<number> {
    // In a production app, you would call a web service to get accurate declination
    // For now, we'll use approximate values based on location

    // Simplified declination calculation (not fully accurate)
    // East of Greenwich: positive, West: negative
    let declination = 0;

    if (longitude < -30 && longitude > -120) {
      // Americas
      declination = -5 + (longitude + 75) * 0.1;
    } else if (longitude > 30 && longitude < 150) {
      // Asia/Middle East
      declination = 2 + (longitude - 90) * 0.05;
    } else if (longitude > -30 && longitude < 30) {
      // Europe/Africa
      declination = 1 + longitude * 0.03;
    }

    this.magneticDeclination = declination;
    return declination;
  }

  /**
   * Start monitoring compass with Qibla direction
   */
  static startCompassMonitoring(
    location: LocationData,
    onUpdate: (data: CompassData) => void
  ): void {
    this.currentLocation = location;

    // Calculate Qibla direction for this location
    const qiblaDirection = this.calculateQiblaDirection(location.latitude, location.longitude);
    const distance = this.calculateDistanceToKaaba(location.latitude, location.longitude);

    // Get magnetic declination
    this.getMagneticDeclination(location.latitude, location.longitude);

    if (Platform.OS === 'ios') {
      // Use iOS heading API for better accuracy
      Location.watchHeadingAsync((heading) => {
        const deviceHeading = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
        const accuracy = heading.accuracy;

        // Calculate relative Qibla direction
        // This gives us the angle we need to rotate from current heading to face Qibla
        const qiblaHeading = (qiblaDirection - deviceHeading + 360) % 360;

        // Check if aligned (within 5 degrees)
        // Aligned when qiblaHeading is close to 0 (Qibla is straight ahead)
        const isAligned = qiblaHeading < 5 || qiblaHeading > 355;

        const compassData = {
          heading: deviceHeading,
          accuracy,
          qiblaDirection,
          qiblaHeading,
          distance,
          isAligned
        };

        onUpdate(compassData);
      }).catch((error) => {
        console.error('[QiblaService] Error starting iOS heading watch:', error);
      });
    } else {
      // Use magnetometer for Android
      this.magnetometerSubscription = Magnetometer.addListener((data) => {
        const deviceHeading = this.calculateHeadingFromMagnetometer(data);

        // Calculate relative Qibla direction
        // This gives us the angle we need to rotate from current heading to face Qibla
        const qiblaHeading = (qiblaDirection - deviceHeading + 360) % 360;

        // Check if aligned (within 5 degrees)
        // Aligned when qiblaHeading is close to 0 (Qibla is straight ahead)
        const isAligned = qiblaHeading < 5 || qiblaHeading > 355;

        // Estimate accuracy based on sensor stability
        const accuracy = this.estimateAccuracy(data);

        const compassData = {
          heading: deviceHeading,
          accuracy,
          qiblaDirection,
          qiblaHeading,
          distance,
          isAligned
        };

        onUpdate(compassData);
      });

      // Set update interval
      Magnetometer.setUpdateInterval(100);
    }
  }

  /**
   * Stop compass monitoring
   */
  static stopCompassMonitoring(): void {
    if (this.magnetometerSubscription) {
      this.magnetometerSubscription.remove();
      this.magnetometerSubscription = null;
    }
    if (this.deviceMotionSubscription) {
      this.deviceMotionSubscription.remove();
      this.deviceMotionSubscription = null;
    }
  }

  /**
   * Calibrate compass
   * User should move device in figure-8 pattern
   */
  static async calibrateCompass(): Promise<void> {
    return new Promise((resolve) => {
      let readings: number[] = [];

      const subscription = Magnetometer.addListener((data) => {
        const heading = this.calculateHeadingFromMagnetometer(data);
        readings.push(heading);

        if (readings.length >= 50) {
          // Calculate average deviation and set calibration offset
          subscription.remove();

          // Simple calibration: find the most stable reading
          const avgHeading = readings.reduce((a, b) => a + b, 0) / readings.length;
          const deviations = readings.map(r => Math.abs(r - avgHeading));
          const minDeviation = Math.min(...deviations);

          if (minDeviation > 10) {
            // Large deviation, needs better calibration
            this.calibrationOffset = 0;
          } else {
            // Small deviation, compass is calibrated
            this.calibrationOffset = 0;
          }

          resolve();
        }
      });

      Magnetometer.setUpdateInterval(50);

      // Timeout after 5 seconds
      setTimeout(() => {
        subscription.remove();
        resolve();
      }, 5000);
    });
  }

  /**
   * Estimate compass accuracy based on sensor data stability
   */
  private static estimateAccuracy(data: any): number {
    // Simple accuracy estimation based on magnetic field strength
    const fieldStrength = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);

    // Normal earth magnetic field is 25-65 μT
    if (fieldStrength < 20 || fieldStrength > 70) {
      return 0; // Poor accuracy, interference detected
    } else if (fieldStrength < 25 || fieldStrength > 65) {
      return 1; // Medium accuracy
    } else {
      return 2; // Good accuracy
    }
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  private static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Format bearing for display
   */
  static formatBearing(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return `${Math.round(bearing)}° ${directions[index]}`;
  }

  /**
   * Get prayer direction text based on Qibla bearing
   */
  static getPrayerDirectionText(qiblaHeading: number): string {
    // qiblaHeading is the angle from device heading to Qibla
    // 0° means Qibla is straight ahead
    // 90° means Qibla is to the right
    // 180° means Qibla is behind
    // 270° means Qibla is to the left

    const angle = qiblaHeading;

    if (angle < 5 || angle > 355) {
      return 'Qibla is straight ahead ✓';
    } else if (angle >= 5 && angle < 30) {
      return 'Turn slightly right →';
    } else if (angle >= 30 && angle < 60) {
      return 'Turn right →';
    } else if (angle >= 60 && angle < 120) {
      return 'Turn far right →';
    } else if (angle >= 120 && angle < 150) {
      return 'Turn around to the right →';
    } else if (angle >= 150 && angle < 210) {
      return 'Turn around ←';
    } else if (angle >= 210 && angle < 240) {
      return 'Turn around to the left ←';
    } else if (angle >= 240 && angle < 300) {
      return 'Turn far left ←';
    } else if (angle >= 300 && angle < 330) {
      return 'Turn left ←';
    } else {
      return 'Turn slightly left ←';
    }
  }
}

export default QiblaService;