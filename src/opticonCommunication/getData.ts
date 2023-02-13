import { CommandBytes, STX } from "./OpticonWrapper";
import { appendCRC2 } from "./crcCalculation";
import { parseBarcode } from "./parseBarcode";

export const getData = async (port: SerialPort) => {
    const writer = port.writable.getWriter();
    const message = appendCRC2([CommandBytes.UploadBarcodeData, STX, 0]);
    await writer.write(new Uint8Array(message));
    const reader = port.readable.getReader();
    // the first 10 bytes are 06 02 and the 8 bytes for the serial number
    // therefore we will just "eat" them
    const prefix = [];
    // the first byte in barcode line is the count of bytes read for this barcode
    // [typeOfBarcode, ...data bytes..., 4 bytes for the timestamp]
    // ireg code suggests, that is not always for, but that is for polling
    let barcodeLength = 0;
    let currentBarcode: number[] = [];
    const barcodes: number[][] = []

    while (true){
        const { value } = await reader.read();

        if (prefix.length !== 10){
            prefix.push(value[0]);
            continue;
        }

        if (barcodeLength === 0 && value[0] === 0){
            //last char in the stream is 0 (before the crc), so if barcode length is 0 and
            //read value is 0 then we are finished
            if (currentBarcode.length){
                //if barcode length was 0 and current barcode has value that means we read some data
                barcodes.push(currentBarcode);
                currentBarcode = [];
            }
            break;
        }

        if (barcodeLength === 0){
            //before each barcode there is byte describing its length, we set it here
            barcodeLength = value[0];
            if (currentBarcode.length){
                //if barcode length was 0 and current barcode has value that means we read some data
                // so lets save it
                barcodes.push(currentBarcode);
                currentBarcode = [];
            }
        } else {
            // just keep reading
            currentBarcode.push(value[0]);
            barcodeLength--;
        }
    }
    writer.releaseLock();
    reader.releaseLock();
    return parseBarcode(barcodes);
}

export const pollData = async (port: SerialPort) => {
    const writer = port.writable.getWriter();
    const message = appendCRC2([CommandBytes.UploadBarcodeData, STX, 0]);
    await writer.write(new Uint8Array(message));
    const reader = port.readable.getReader();
    const prefix = [];
    let barcodeLength = 0;
    let currentBarcode: number[] = [];
    const barcodes: number[][] = []

    while (true){
        const { value } = await reader.read();

        if (prefix.length !== 10){
            prefix.push(value[0]);
            continue;
        }

        if (barcodeLength === 0){
            //before each barcode there is byte describing its length, we set it here
            barcodeLength = value[0];
            if (currentBarcode.length){
                //if barcode length was 0 and current barcode has value that means we read some data
                // so lets save it
                barcodes.push(currentBarcode);
                currentBarcode = [];
                break;
            }
        } else {
            // just keep reading
            currentBarcode.push(value[0]);
            barcodeLength--;
        }
    }
    writer.releaseLock();
    reader.releaseLock();
    return parseBarcode(barcodes);
}

