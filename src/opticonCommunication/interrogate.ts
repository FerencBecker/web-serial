import { appendCRC2 } from "./crcCalculation";
import { CommandBytes, STX } from "./OpticonWrapper";

const responseLength = 23;

export const interrogate = async (port: SerialPort) => {
    const writer = port.writable.getWriter();
    const message = appendCRC2([CommandBytes.Interrogate, STX, 0]);
    await writer.write(new Uint8Array(message));
    const reader = port.readable.getReader();

    const response = [];
    while (true){
        const { value, done } = await reader.read();
        response.push(value[0]);
        if (response.length === responseLength){
            break;
        }
    }
    writer.releaseLock();
    reader.releaseLock();
    return response;
}
