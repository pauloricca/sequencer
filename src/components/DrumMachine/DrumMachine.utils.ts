import { SelectKnobProps } from 'components/SelectKnob/SelectKnob.types';
import { HIGH_PITCH_ADJUSTMENT } from './DrumMachine.constants';
import samplesMeta from 'metadata/samples.meta.json';

/*
 * pitchParam scale from 0 (lowest), through 1 (neutral), to 2 (highest), so that we can average two pitch
 * settings (e.g. a global and a local) and cancel eachother out with opposite values.
 */
export const getAdjustedPitch = (pitchParam: number) =>
  pitchParam > 1 ? 1 + (pitchParam - 1) * HIGH_PITCH_ADJUSTMENT : pitchParam;

export const getSamplesFileOptions = (): SelectKnobProps['items'] => {
  const options: SelectKnobProps['items'] = [];
  const processDirectory = (samplesInDirectory: typeof samplesMeta.samples, path = '') => {
    samplesInDirectory.forEach((entry) => {
      const nameWithPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.type === 'file') {
        options.push({ value: nameWithPath });
      } else if (entry.samples) {
        processDirectory(entry.samples, nameWithPath);
      }
    });
  };

  processDirectory(samplesMeta.samples);

  samplesMeta.samples.forEach(() => {});

  return options;
};
