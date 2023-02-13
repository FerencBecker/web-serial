import { CommandBytes, STX } from "./OpticonWrapper";
import { appendCRC2 } from "./crcCalculation";

export const getData = async (port: SerialPort) => {
    const writer = port.writable.getWriter();
    const message = appendCRC2([CommandBytes.UploadBarcodeData, STX, 0]);
    await writer.write(new Uint8Array(message));
    const reader = port.readable.getReader();
    const prefix = [];
    let barcodeLength = 0;
    let currentBarcode: number[] = [];
    const barcodes: number[][] = []

    while (true){
        const { value, done } = await reader.read();
        if (prefix.length !== 10){
            prefix.push(value[0]);
            continue;
        }

        if (barcodeLength === 0 && value[0] === 0){
            //last char in the strean is 0 (before the crc), so if barcode length is 0 and
            //read value is 0 then we are finished
            break;
        }

        if (barcodeLength === 0){
            //before each barcode there is byte describing its length
            barcodeLength = value[0];
            if (currentBarcode.length){
                //if barcode length was 0 and current barcode has value that means we read some data
                barcodes.push(currentBarcode);
                currentBarcode = [];
            }
            continue;
        } else {
            currentBarcode.push(value[0]);
            barcodeLength--;
            continue;
        }

        if(done){
            break;
        }
    }
    writer.releaseLock();
    reader.releaseLock();
    return barcodes;
}
