import { ToTicketUrlPipe } from './to-ticket-url.pipe';

describe('ToTicketUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new ToTicketUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
