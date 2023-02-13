import { appendCRC } from "./crcCalculation";
import { DateTime } from "luxon";
import { CommandBytes, STX } from "./OpticonWrapper";

const LowBatteryError = 0xFF;

export const getTime = async (port: SerialPort) => {
    const writer = port.writable.getWriter();
    await sendGetTimeCommand(writer);

    const reader = port.readable.getReader();
    //what will end up in result
    // HH and LL are the bytes for the CRC
    //[ statusCode,stx,count,sec or LowBatteryError, min, hour, day, month, year(last 2 digits), null(0), HH, LL ]
    const results = await readTime(reader);
    //todo: should we check the crc?
    const date = DateTime.local(2000 + results[8], results[7], results[6], results[5], results[4], results[3]);
    reader.releaseLock();
    writer.releaseLock();
    return date;
};

const sendGetTimeCommand = async (writer: WritableStreamDefaultWriter<any>) => {
    const message = [ CommandBytes.GetTime, STX, 0 ];
    await writer.write(new Uint8Array(appendCRC(message)));
};

async function readTime(reader: ReadableStreamDefaultReader<any>) {
    const results = [];

    while (true) {
        const { value, done } = await reader.read();
        const typedValue = value as Uint8Array;
        results.push(typedValue[0]);
        //it seems it never gets done....
        //todo: the time result always 12 bytes, but it is possible that errors mess that up...
        //test by sending bad command, mat be with bad crc?
        //some time out handling could take care of these cases, nothing in 10 secs => failed
        if (done || results.length === 12)
            break;
    }
    if (results[3] === LowBatteryError) {
        //this is a status byte the battery is low, the clock keeping sync is not guaranteed
        //handle it when it is actually developed
        throw new Error('Battery is low!');
    }
    return results;
}
