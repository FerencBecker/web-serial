import { appendCRC, appendCRC2, CheckSum } from "./crcCalculation";

describe('crc calculation', () => {
    describe('append crc', () => {
        //todo: append the rest
        it('calculates the crc for interrogation', () => {
            const message = [0x01, 0x02, 0x00];
            const expected = [...message, 159, 222];
            const crc = appendCRC(message);
            expect(crc).toStrictEqual(expected);
        });

        it('calculates the crc for gettime', () => {
            const message = [0x0a, 0x02, 0x00];
            const expected = [...message, 0x5d, 0xaf];
            const crc = appendCRC(message);
            expect(crc).toStrictEqual(expected);
        });

        it('could be used for crc validation data got from the device', () => {
            const getTimeOffTheWire = [6,2,6,22,4,20,10,2,23,0,3,29];
            const message = [6,2,6,22,4,20,10,2,23,0];
            const crc = appendCRC(message);
            expect(crc).toStrictEqual(getTimeOffTheWire);
        });
    });

    describe('append crc2', () => {
        it('calculates the crc for interrogation', () => {
            const message = [0x01, 0x02, 0x00];
            const expected = [...message, 159, 222];
            const crc = appendCRC2(message);
            expect(crc).toStrictEqual(expected);
        });

        it('calculates the crc for get time', () => {
            const message = [0x0a, 0x02, 0x00];
            const expected = [...message, 0x5d, 0xaf];
            const crc = appendCRC2(message);
            expect(crc).toStrictEqual(expected);
        });

        it('could be used for crc validation data got from the device', () => {
            const getTimeOffTheWire = [6,2,6,22,4,20,10,2,23,0,3,29];
            const message = [6,2,6,22,4,20,10,2,23,0];
            const crc = appendCRC2(message);
            expect(crc).toStrictEqual(getTimeOffTheWire);
        });
    });

    describe('Check sum', () => {
       it('takes the high and low byte correctly', () => {
          const checkSum = new CheckSum();
          expect(checkSum.getHighByte()).toBe(255);
          expect(checkSum.getLowByte()).toBe(255);
       });
    });
});
