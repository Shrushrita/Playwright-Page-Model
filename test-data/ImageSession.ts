export interface NewImageSessionData {
  firstIndicator: string;
  lastIndicator: string;
  recordDate: string; // YYYY-MM-DD
  Alignment: string;
  language: string;
}

export const testImageSession: NewImageSessionData = {
  firstIndicator: 'Test',
  lastIndicator: 'ImageSession',
  recordDate: '1990-01-01',
  Alignment: 'Prefer not to say',
  language: 'English',
};
