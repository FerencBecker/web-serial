import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { OpticonWrapper } from "./opticonCommunication/OpticonWrapper";
import { DateTime } from "luxon";

enum Actions {
  None = 0,
  Connect = 1,
  GetTime = 2,
  ConfigureBarcodes = 3,
  Interrogate = 4,
  GetData = 5
}

function App() {

  const [action, setAction] = useState(Actions.None);
  const [history, setHistory] = useState<Actions[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [readDate, setReadDate] = useState<DateTime | undefined>();
  try {
    OpticonWrapper.checkAvailability();
  } catch (e){
    const err = e as Error;
    alert(err.message);
  }

  const wrapper = useMemo(() => new OpticonWrapper(), []);

  useEffect(() => {
    if (action === Actions.Connect){
      const connect = async () => {
        await wrapper.connect();
        setIsConnected(true);
        setAction(Actions.None);
        setHistory((h) => [...h, Actions.Connect]);
      };
      connect();
    }
  }, [action, wrapper]);

  useEffect(() => {
    if (action === Actions.GetTime){
      const getTime = async () => {
        const date = await wrapper.getTime();
        setReadDate(date);
        setAction(Actions.None);
        setHistory((h) => [...h, Actions.GetTime]);
      };
      getTime();
    }
  }, [action, wrapper]);

  useEffect(() => {
    if (action === Actions.ConfigureBarcodes){
      const configureBarCodes = async () => {
        await wrapper.configureBarcodeTypes();
        setAction(Actions.None);
        setHistory((h) => [...h, Actions.ConfigureBarcodes]);
      };
      configureBarCodes();
    }
  }, [action, wrapper]);

  useEffect(() => {
    if (action === Actions.Interrogate){
      const interrogate = async () => {
        await wrapper.interrogate();
        setAction(Actions.None);
        setHistory((h) => [...h, Actions.Interrogate]);
      };
      interrogate();
    }
  }, [action, wrapper]);

  useEffect(() => {
    if (action === Actions.GetData){
      const getData = async () => {
        const barcodes = await wrapper.getData();
        console.log(barcodes);
        setAction(Actions.None);
        setHistory((h) => [...h, Actions.GetData]);
      };
      getData();
    }
  }, [action, wrapper]);

  return (
    <div className="App" style={{display: 'flex'}}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        { action !== Actions.None && <div>{`Right now: ${Actions[action]}`}</div>}
        { isConnected && <div>Connected</div>}
        { !isConnected && <button onClick={() => setAction(Actions.Connect)}>Connect</button>}
        { isConnected && <button onClick={() => setAction(Actions.GetTime)}>Get time</button>}
        { readDate && <div>{`Date on scanner: ${readDate.toISO()}`}</div>}
        { isConnected && <button onClick={() => setAction(Actions.ConfigureBarcodes)}>Configure bar code types</button>}
        { isConnected && <button onClick={() => setAction(Actions.Interrogate)}>Interrogate</button>}
        { isConnected && <button onClick={() => setAction(Actions.GetData)}>Get data</button>}
      </div>
      <ul style={{display: 'flex', flexDirection: 'column'}}>
        { history.map((v, i) => {
          return <li key={i}>{Actions[v]}</li>
        })}
      </ul>
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
