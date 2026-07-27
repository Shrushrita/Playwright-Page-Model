export interface NewPatientData {
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  sex: string;
  language: string;
}

export const testPatient: NewPatientData = {
  firstName: 'Test',
  lastName: 'Patient',
  birthDate: '1990-01-01',
  sex: 'Prefer not to say',
  language: 'English',
};
