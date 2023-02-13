import { DateTime } from 'luxon';
import { getTime } from "./getTime";
import { appendCRC2 } from "./crcCalculation";
import { setEnabledBarcodes } from "./setEnabledBarcodes";
import { interrogate } from "./interrogate";
import { getData, pollData } from "./getData";

export const CommandBytes = {
    Interrogate: 1,
    ClearBarCodes: 2,
    DownloadParameters: 3,
    Special: 4,
    PowerDown: 5,
    UploadBarcodeData: 7,
    UploadParameters: 8,
    SetTime: 9,
    GetTime: 10
}

export enum StatusCode {
    NeverToBeUsed = 0,
    UnSupportedCommandNumber = 5,
    Success = 6,
    CommandCrcError = 7,
    ReceivedCharacterError = 8,
    GeneralError = 9,
    NeverToBeUsed2 = 255
    //rest of the codes are reserved by manufacturer
}

//it is from ascii means start of text
export const STX = 2;

//todo: we will need to check it what happens in a turbo application
//I mean that is like 2 levels of indirection (Chromium running in a dotnet app + Turbo itself)
export class OpticonWrapper {
    private port: SerialPort = undefined as unknown as SerialPort;

    public static checkAvailability = () => {
        if (!navigator.serial) {
            throw new Error("The serial interface is only available in Chrome based browsers!");
        }
    }

    public connect = async () => {
        const ports: SerialPort[] = await navigator.serial.getPorts();
        //todo: we have to think about this, although using it more user friendly
        //"old" ports are no forgotten I had the port come up as COM3, COM5 and COM6
        //it seems to be related to which USB port I am using
        //todo: we need to check what happens if the proper drivers are not installed
        //it is possible that csp2.dll handles this case...
        if (ports.length) {
            this.port = ports[0];
        } else {
            this.port = await navigator.serial.requestPort();
        }
    }

    //todo: opening and closing the connection might not be the best idea...
    //if we open it and keep it open the user gets an icon in the page header which is better ux
    //but open and close makes recovery more easier
    public getTime = async () => {
        //todo: bufferSize is 1, because with bigger buffers sometimes it gets status code in an array
        // then the rest in another, so reading one by one is the way to go....
        // e.g [6], [stx, 6, .....]
        // although it seems to be messing the message sent, which is now more than one line in the monitor
        // but work, so....
        await this.open(1);
        const date = await getTime(this.port)
        await this.close();
        return date;
    }

    //enables or disables barcode types 39 and 128 are enabled, rest disabled
    public configureBarcodeTypes = async () => {
        //it is an 8 because, that is how long a command is in this scenario
        //having longer or shorter seem to be causing problems
        await this.open(8);
        await setEnabledBarcodes(this.port);
        await this.port.close();
    };

    public interrogate = async () => {
        await this.open(1);
        await interrogate(this.port);
        await this.close();
    }

    public getData = async () => {
        await this.open(1);
        const barcodes = await getData(this.port);
        await this.close();
        return barcodes;
    }

    public deleteData = async () => {
        await this.open(1);
        const writer = this.port.writable.getWriter();
        const message = appendCRC2([CommandBytes.ClearBarCodes, STX, 0]);
        await writer.write(new Uint8Array(message));
        writer.releaseLock();
        await this.close();
    }

    public polling = async () => {

        const barcodes = await this.getData();
        if (barcodes.length){
            throw new Error('There is data on device!');
        }
        await this.open(1);
        const polled = await pollData(this.port);
        await this.close();
        await this.deleteData();
        return polled;
    }

    public setTime = async () => {
        await this.open(1);
        const message = appendCRC2([CommandBytes.SetTime, STX, 6, 30, 30, 12, 1, 1, 11, 0]);
        const writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array(message));
        writer.releaseLock();
        await this.close();
    }

    private open = async (bufferSize: number) => {
        await this.port.open({ baudRate: 9600, parity: "odd", dataBits: 8, stopBits: 1, bufferSize });
    }

    private close = async () => {
        await this.port.close();
    }
}
