import { BadRequestException } from '@nestjs/common';
import { EndMinuteOfDay } from '@shared/domain/models/value-objects/number/integer/end-minute-of-day.value-object';
import { LimitValueObject } from '@shared/domain/models/value-objects/number/integer/limit.value-object';
import { PageValueObject } from '@shared/domain/models/value-objects/number/integer/page.value-object';
import { StartMinuteOfDay } from '@shared/domain/models/value-objects/number/integer/start-minute-of-day.value-object';

describe('Integer value objects', () => {
  describe('PageValueObject', () => {
    describe('constructor', () => {
      it('should accept positive integer pages', () => {
        const page = new PageValueObject(1);

        expect(page.toNumber()).toBe(1);
      });

      it('should reject non-integer pages', () => {
        expect(() => new PageValueObject(1.5)).toThrow(BadRequestException);
      });

      it('should reject non-positive pages', () => {
        expect(() => new PageValueObject(0)).toThrow(BadRequestException);
      });
    });
  });

  describe('LimitValueObject', () => {
    describe('constructor', () => {
      it('should accept positive integer limits', () => {
        const limit = new LimitValueObject(10);

        expect(limit.toNumber()).toBe(10);
      });

      it('should reject non-positive limits', () => {
        expect(() => new LimitValueObject(-1)).toThrow(BadRequestException);
      });
    });
  });

  describe('StartMinuteOfDay', () => {
    describe('constructor', () => {
      it('should accept valid minutes of day', () => {
        const startMinute = new StartMinuteOfDay(0);

        expect(startMinute.toNumber()).toBe(0);
      });

      it('should reject minutes greater than the day length', () => {
        expect(() => new StartMinuteOfDay(1441)).toThrow(BadRequestException);
      });
    });
  });

  describe('EndMinuteOfDay', () => {
    describe('constructor', () => {
      it('should accept valid end minutes of day', () => {
        const endMinute = new EndMinuteOfDay(1440);

        expect(endMinute.toNumber()).toBe(1440);
      });

      it('should reject negative end minutes', () => {
        expect(() => new EndMinuteOfDay(-1)).toThrow(BadRequestException);
      });
    });
  });
});
