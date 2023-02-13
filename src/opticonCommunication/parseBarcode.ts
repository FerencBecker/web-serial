import { DateTime } from "luxon";
import { BarCodeType } from "./setEnabledBarcodes";


function to8Bit(byte?: number) {
    let asString = byte?.toString(2) ?? '';
    // pad to 8 bits
    if (asString.length < 8) {
        const diff = 8 - asString.length;
        for (let i = 0; i < diff; i++)
            asString = '0' + asString;
    }
    return asString;
}

function getTimestamp(current: number[]) {
    // last 4 bytes in the array contain the timestamp
    // {6bits for secs}{6bits for mins}{5bits for hours}{5 bits for days}{4bits for months}{6bits for years}
    const firstByte = current.at(-4);
    const secondByte = current.at(-3);
    const thirdByte = current.at(-2);
    const fourthByte = current.at(-1);

    let allStamps = to8Bit(firstByte) + to8Bit(secondByte) + to8Bit(thirdByte) + to8Bit(fourthByte);

    let year = 2000 + parseInt(allStamps.substring(26, 32), 2);
    let month = parseInt(allStamps.substring(22, 26), 2);
    let day = parseInt(allStamps.substring(17, 22), 2);
    let hour = parseInt(allStamps.substring(12, 17), 2);
    let minute = parseInt(allStamps.substring(6, 12), 2);
    let second = parseInt(allStamps.substring(0, 6), 2);
    return DateTime.local(year, month, day, hour, minute, second)
        .toISO({ includeOffset: false, suppressMilliseconds: true});
}

export const parseBarcode = (readCodes: number[][]) => {
    const parsedCodes = [];
    for (let i = 0; i < readCodes.length; i++) {
        const current = readCodes[i];
        const barCode: Barcode = {
            barcodeData: '',
            //we only support 2 types if not 3 then it is the other
            type: current[0] === 3 ? BarCodeType.CODE128 : BarCodeType.CODE39,
            timestamp: ''
        };

        // these should be barcode chars since the first bit is the type
        // and last 2 bytes are the timestamp
        for (let j = 1; j < current.length - 4; j++)
            barCode.barcodeData += String.fromCharCode(current[j]);

        barCode.timestamp = getTimestamp(current);
        parsedCodes.push(barCode);
    }

    return parsedCodes;
}

export type Barcode = {
    barcodeData: string;
    timestamp: string;
    type: BarCodeType;
}
