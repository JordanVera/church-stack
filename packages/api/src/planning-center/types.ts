export type PcoJsonApiResource = {
  type: string;
  id: string;
  attributes: Record<string, unknown>;
  relationships?: Record<
    string,
    {
      data:
        | { type: string; id: string }
        | Array<{ type: string; id: string }>
        | null;
    }
  >;
};

export type PcoJsonApiListResponse = {
  data: PcoJsonApiResource[];
  included?: PcoJsonApiResource[];
  errors?: Array<{ detail?: string; title?: string; status?: string }>;
};

export type ImportedServiceTime = {
  pcoServiceTimeId: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
};

export type ImportedCampus = {
  pcoCampusId: string;
  name: string;
  address: string;
  contactEmail: string | null;
  services: ImportedServiceTime[];
};
