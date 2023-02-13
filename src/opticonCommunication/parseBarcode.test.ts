import { parseBarcode } from "./parseBarcode";
describe('parseBarcode', () => {
    it('parses the code and the timestamp', () => {
        const input = [
            [ 3, 48, 48, 49, 54, 54, 52, 57, 52, 65, 48, 48, 48, 50, 57, 48, 48, 48, 52, 53, 27, 24, 86, 86 ],
            [ 3, 65, 48, 48, 48, 50, 57, 48, 48, 48, 52, 55, 33, 245, 248, 87 ],
            [ 3, 48, 48, 48, 48, 48, 53, 56, 51, 52, 50, 155, 37, 120, 87 ],
            [ 3, 48, 48, 48, 48, 48, 53, 56, 51, 51, 57, 3, 53, 120, 87 ],
            [ 3, 48, 48, 48, 48, 48, 53, 56, 51, 51, 57, 165, 70, 144, 151 ]
        ];

        const expected = [
            {barcodeData:"00166494A0002900045",type:8,timestamp:"2022-09-21T16:49:06"},
            {barcodeData:"A0002900047",type:8,timestamp:"2023-01-30T11:31:08"},
            {barcodeData:"0000058342",type:8,timestamp:"2023-01-30T10:50:38"},
            {barcodeData:"0000058339",type:8,timestamp:"2023-01-30T10:51:00"},
            {barcodeData:"0000058339",type:8,timestamp:"2023-02-04T13:20:41"}
        ];

        const barcodes = parseBarcode(input);
        expect(barcodes).toStrictEqual(expected);
    });
})
