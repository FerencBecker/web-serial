import React, { useCallback, useMemo, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [port, setPort] = useState<SerialPort>();
  
  const sendCommand = async (command: Uint8Array) => {
    if (port === undefined) return Promise.reject();

    await port.open({ baudRate: 9600 });
    console.log('open finished');
    
    // @ts-ignore
    // const signals = await port.getSignals();
    // console.log(signals);
    
    const writer = port?.writable.getWriter();
    await writer.write(command);
    await writer.close();
    await port.close();
  };
  
  const initialize = async () => {
    const port = await navigator.serial.requestPort();
    setPort(port);
    console.log('>>Initialization is done.');
  };
  
  const getTimeouts = async () => {
    await sendCommand(uintGetTimeoutCommand);
    console.log(`>>Serialized command: "${uintGetTimeoutCommand}"`)
  };

  // Read
  // eslint-disable-next-line no-undef
  // const decoder = new TextDecoderStream();
  // const inputDone = await port.readable.pipeTo(decoder.writable);
  // const reader = inputDone.getReader();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={initialize}>Initialize</button>
        <button onClick={getTimeouts}>GetTimeouts</button>
      </header>
    </div>
  );
}

export default App;

const toArray = (hexValues: string) => hexValues.split(' ');
const toHexDigits = (hexValue: string) => hexValue.split('');
const toDecimalValue = (hexDigits: string[]) => (toDecimal(hexDigits[0]) * 16) + toDecimal(hexDigits[1]);
const toDecimal = (hex: string) => {
  if (hex.length === 0) return -1;
  const code = hex.toUpperCase().charCodeAt(0);
  if (code > 47 && code < 58) return code - 48;
  if (code > 64 && code < 71) return code - 55;
  return -1;
};
const toCharacter = (decimalValue: number) => String.fromCharCode(decimalValue);
const toCommand = (hexAsText: string) =>
    toArray(hexAsText).map(toHexDigits).map(toDecimalValue).map(toCharacter).join('');

const toUintCommand = (hexAsText: string) => new Uint8Array(toArray(hexAsText).map(toHexDigits).map(toDecimalValue));

const getTimeoutCommand = toCommand('14 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00');
const uintGetTimeoutCommand = toUintCommand('14 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00');
