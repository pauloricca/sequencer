import React from 'react';
import { useSequencersState } from 'state/state';
import { useMidiDeviceNames } from 'utils/midi';
require('./_ControllerControlsConfigModalMidiClockSend.scss');

export const ControllerControlsConfigModalMidiClockSend: React.FC = () => {
  const midiClockSendDevices = useSequencersState((state) => state.midiClockSend).map(
    ({ midiOutputDeviceName }) => midiOutputDeviceName
  );
  const addMidiClockSendDevice = useSequencersState((state) => state.addMidiClockSendDevice);
  const removeMidiClockSendDevice = useSequencersState((state) => state.removeMidiClockSendDevice);
  const midiDeviceNames = useMidiDeviceNames('output');

  return (
    <div className="controller-controls-config-modal-midi-clock-send">
      <p className="controller-controls-config-modal-midi-clock-send-header">
        send MIDI clock messages to:
      </p>
      {midiDeviceNames.map((midiDevice) => (
        <label className="controller-controls-config-modal-midi-clock-send__item" key={midiDevice}>
          <input
            type="checkbox"
            checked={midiClockSendDevices.includes(midiDevice)}
            onChange={() => {
              if (midiClockSendDevices.includes(midiDevice)) {
                removeMidiClockSendDevice(midiDevice);
              } else {
                addMidiClockSendDevice({ midiOutputDeviceName: midiDevice, ppq: 24 });
              }
            }}
          />
          {midiDevice}
        </label>
      ))}
    </div>
  );
};
