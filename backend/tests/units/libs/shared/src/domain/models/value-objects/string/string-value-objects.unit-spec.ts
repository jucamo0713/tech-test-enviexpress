import { BadRequestException } from '@nestjs/common';
import {
  CallingCode,
  Cellphone,
  Currency,
  DatabaseTransactionId,
  Email,
  LangIsoCode,
  SortValues,
  StringValueObject,
  Timezone,
  WeekDay,
} from '@shared/domain/models/value-objects';
import {
  CurrencyConstants,
  LangIsoCodeConstants,
  SortValuesConstants,
  WeekDayConstants,
} from '@shared/domain/models/constants';
import { SharedValueObjectsMother } from '@tests/mothers-and-mocks/libs/shared/src/domain/models/value-objects/shared-value-objects.mother';

describe('String value objects', () => {
  describe('StringValueObject', () => {
    describe('toString', () => {
      it('should return the wrapped string value', () => {
        const valueObject = new StringValueObject('value');

        expect(valueObject.toString()).toBe('value');
      });
    });
  });

  describe('CallingCode', () => {
    describe('constructor', () => {
      it('should remove the plus sign from calling codes', () => {
        const callingCode = new CallingCode(
          SharedValueObjectsMother.callingCode(),
        );

        expect(callingCode.toString()).toBe('57');
      });
    });
  });

  describe('Cellphone', () => {
    describe('constructor', () => {
      it('should trim the cellphone value', () => {
        const cellphone = new Cellphone(SharedValueObjectsMother.cellphone());

        expect(cellphone.toString()).toBe('3001234567');
      });
    });
  });

  describe('Email', () => {
    describe('constructor', () => {
      it('should normalize valid emails', () => {
        const email = new Email(SharedValueObjectsMother.email());

        expect(email.toString()).toBe('user@test.com');
      });

      it('should reject invalid emails', () => {
        expect(
          () => new Email(SharedValueObjectsMother.invalidEmail()),
        ).toThrow(BadRequestException);
      });
    });
  });

  describe('Currency', () => {
    describe('getInstance', () => {
      it('should return a singleton normalized currency', () => {
        const currency = Currency.getInstance('cop');

        expect(currency.toString()).toBe(CurrencyConstants.COP);
        expect(currency).toBe(Currency.getInstance('cop'));
      });
    });
  });

  describe('LangIsoCode', () => {
    describe('getInstance', () => {
      it('should return a singleton normalized language iso code', () => {
        const lang = LangIsoCode.getInstance('ES');

        expect(lang.toString()).toBe(LangIsoCodeConstants.es);
        expect(lang).toBe(LangIsoCode.getInstance('ES'));
      });
    });
  });

  describe('SortValues', () => {
    describe('toSortNumber', () => {
      it('should map ascending sort to 1 and descending sort to -1', () => {
        expect(SortValues.getInstance('asc').toSortNumber()).toBe(1);
        expect(SortValues.getInstance('desc').toSortNumber()).toBe(-1);
        expect(SortValues.getInstance('ASC').toString()).toBe(
          SortValuesConstants.ASC,
        );
      });
    });
  });

  describe('Timezone', () => {
    describe('constructor', () => {
      it('should accept valid IANA timezones', () => {
        const timezone = new Timezone(SharedValueObjectsMother.timezone());

        expect(timezone.toString()).toBe('America/Bogota');
      });

      it('should reject invalid timezones', () => {
        expect(() => new Timezone('Invalid/Timezone')).toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe('WeekDay', () => {
    describe('getInstance', () => {
      it('should return a singleton normalized week day', () => {
        const weekDay = WeekDay.getInstance('monday');

        expect(weekDay.toString()).toBe(WeekDayConstants.MONDAY);
        expect(weekDay).toBe(WeekDay.getInstance('MONDAY'));
      });
    });
  });

  describe('DatabaseTransactionId', () => {
    describe('generateInstance', () => {
      it('should generate a database transaction id instance', () => {
        const transactionId = DatabaseTransactionId.generateInstance();

        expect(transactionId).toBeInstanceOf(DatabaseTransactionId);
        expect(transactionId.toString()).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
      });
    });
  });
});
