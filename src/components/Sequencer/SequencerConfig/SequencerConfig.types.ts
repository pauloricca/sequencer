import { ReactNode } from 'react';
import { StateSequenceStepProperties } from 'state/state.types';

export default interface SequencerConfigTool {
  name: string;
  value: keyof StateSequenceStepProperties | null;
  icon: string;
  isHidden?: boolean;
}

export interface SequencerConfigProps {
  sequenceId: string;
  tools: SequencerConfigTool[];
  selectedTool?: keyof StateSequenceStepProperties | null;
  onSelectTool?: (value: keyof StateSequenceStepProperties | null) => void;
  sequencerConfigCallback?: () => ReactNode;
  configControls?: ReactNode;
}
