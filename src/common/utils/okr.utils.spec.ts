import { calculateProgress, calculateObjectiveProgress } from './okr.utils';

describe('OKR Utils', () => {
  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      expect(calculateProgress(50, 0, 100)).toBe(50);
      expect(calculateProgress(100, 0, 100)).toBe(100);
      expect(calculateProgress(0, 0, 100)).toBe(0);
    });

    it('should clamp progress to 0 minimum', () => {
      expect(calculateProgress(-10, 0, 100)).toBe(0);
    });

    it('should clamp progress to 100 maximum', () => {
      expect(calculateProgress(150, 0, 100)).toBe(100);
    });

    it('should throw when targetValue equals startValue', () => {
      expect(() => calculateProgress(50, 50, 50)).toThrow();
    });

    it('should handle non-zero start values', () => {
      expect(calculateProgress(15, 10, 20)).toBe(50);
    });
  });

  describe('calculateObjectiveProgress', () => {
    it('should return 0 for empty array', () => {
      expect(calculateObjectiveProgress([])).toBe(0);
    });

    it('should return average of progresses', () => {
      expect(calculateObjectiveProgress([50, 100])).toBe(75);
      expect(calculateObjectiveProgress([30, 60, 90])).toBe(60);
    });
  });
});
