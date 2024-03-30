import { StateSequenceChannelConfigCommon } from 'state/state.types';
import { SequencerChannelProps } from './SequencerChannel/SequencerChannel';
import { SequencerConfigProps } from './SequencerConfig/SequencerConfig.types';

export interface SequencerProps
  extends Pick<
      SequencerChannelProps,
      'triggerCallback' | 'showChannelControls' | 'channelConfigComponents'
    >,
    Pick<SequencerConfigProps, 'sequencerConfigCallback'> {
  sequenceName: string;
  channelsConfig: StateSequenceChannelConfigCommon[];
}
