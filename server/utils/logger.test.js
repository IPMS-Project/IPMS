const fs = require("fs");
const path = require("path");

jest.mock("fs", () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    appendFileSync: jest.fn(),
  }));

describe("logger", () => {
    const logFilePath = path.join(__dirname, "../logs/cronJobs.log");

    beforeEach(() => {
        fs.existsSync.mockClear();
        fs.mkdirSync.mockClear();
        fs.appendFileSync.mockClear();
        fs.existsSync.mockReturnValue(false);
    });
    
    it("creates log directory", () => {
        require("./logger");
        expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it("does not create a log directory", () => {
        fs.existsSync.mockReturnValue(true);
        require("./logger");
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it("writes info message", () => {
        const logger = require("./logger");
        const message = "This is an info message";
        logger.info(message);
        expect(fs.appendFileSync).toHaveBeenCalledWith(logFilePath, expect.stringContaining("[INFO]"), "utf-8");
        expect(fs.appendFileSync).toHaveBeenCalledWith(logFilePath, expect.stringContaining(message), "utf-8");
    });

    it("writes warn message", () => {
        const logger = require("./logger");
        const message = "This is a warn message";
        logger.warn(message);
        expect(fs.appendFileSync).toHaveBeenCalledWith(logFilePath, expect.stringContaining("[WARN]"), "utf-8");
        expect(fs.appendFileSync).toHaveBeenCalledWith(logFilePath, expect.stringContaining(message), "utf-8");
    });

    it("writes error message", () => {
        const logger = require("./logger");
        const message = "This is an error message";
        logger.error(message);
        expect(fs.appendFileSync).toHaveBeenCalledWith(logFilePath, expect.stringContaining("[ERROR]"), "utf-8");
        expect(fs.appendFileSync).toHaveBeenCalledWith(logFilePath, expect.stringContaining(message), "utf-8");
    });
});
