export const SharedValueObjectsMother = {
  callingCode(): string {
    return '+57';
  },

  cellphone(): string {
    return ' 3001234567 ';
  },

  email(): string {
    return ' User@Test.com ';
  },

  invalidEmail(): string {
    return 'invalid-email';
  },

  timezone(): string {
    return 'America/Bogota';
  },
} as const;
