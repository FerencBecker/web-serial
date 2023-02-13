import { appendCRC2 } from "./crcCalculation";
import { CommandBytes, STX } from "./OpticonWrapper";

export enum BarCodeType {
    CODE128 = 8,
    EAN = 9,
    RSS = 20,
    CODE39 = 31,
    EAN128 = 52,
    UPC = 53,
    I2OF5 = 58
}

export const setEnabledBarcodes = async (port: SerialPort) => {
    const allBarcodes: BarCodeType[] = Object.values(BarCodeType)
        .filter(x => typeof x === 'number') as BarCodeType[];
    const commands = allBarcodes.map(x => {
        if (x === BarCodeType.CODE39 || x === BarCodeType.CODE128) {
            return [ CommandBytes.DownloadParameters, STX, 2, x, 1, 0 ];
        } else {
            return [ CommandBytes.DownloadParameters, STX, 2, x, 0, 0 ];
        }
    });

    const writer = port.writable.getWriter();
    //todo: technically we could check if the setting of barcode types is done properly
    // after setting one we could read it from the device
    // then change first byte of command to 6, calc the crc and compare to the read result
    // don't know if it is necessary
    for (let i = 0; i < commands.length; i++) {
        const executable = new Uint8Array(appendCRC2(commands[i]));
        await writer.write(executable);
    }
    writer.releaseLock();
}
