export class RebirthdbError extends Error {
  constructor(message: string, public readonly errorCode?: number) {
    super(message);
    this.name = 'RebirthdbError';
    Error.captureStackTrace(this, RebirthdbError);
  }
}
