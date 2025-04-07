const cron = require('node-cron');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

jest.mock('fs');
jest.mock('nodemailer');
jest.mock('node-cron');

describe('cronJob', () => {
  const logPath = path.join(__dirname, 'emailLogs.json');
  let sendEmailMock;

  beforeEach(() => {
    fs.writeFileSync.mockClear();
    nodemailer.createTransport.mockClear();
    cron.schedule.mockClear();
    
    // mock used functions
    sendEmailMock = jest.fn().mockResolvedValue({
      messageId: '12345',
    });
    nodemailer.createTransport.mockReturnValue({
      sendMail: sendEmailMock,
    });
    cron.schedule.mockImplementation((schedule, callback) => {
      callback();
    });
  });

  it('sends email', async () => {
    require('./cronJob');
    // wait for async to resolve
    await new Promise((resolve) => setImmediate(resolve));
    // Check that schedule was called
    expect(cron.schedule).toHaveBeenCalledTimes(1);
    expect(cron.schedule).toHaveBeenCalledWith('*/2 * * * *', expect.any(Function));
    // Check that sendEmail was called
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledWith({
      from: `"IPMS Notifications" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "IPMS Automated Email",
      text: "This is a test email sent by the IPMS cron server.",
    });
    // logToFile Passes : Check writeFileSync status
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
        logPath,
        expect.stringContaining('"status": "Success"'),
        'utf-8'
    );
  });
});
