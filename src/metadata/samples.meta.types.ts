export type SamplesMetadataFile = {
  type: 'file';
  name: string;
};

export type SamplesMetadataDirectory = {
  type: 'directory';
  name: string;
  samples: SamplesMetadataEntry[];
};

export type SamplesMetadataEntry = SamplesMetadataFile | SamplesMetadataDirectory;

export type SamplesMetadata = {
  samples: SamplesMetadataEntry[];
};
