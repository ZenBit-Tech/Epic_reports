interface IObservationReference {
  reference: string;
  display: string;
}

interface IDiagnosticReport {
  resourceType: string;
  id: string;
  status: string;
  code: {
    text: string;
  };
  category: Array<{ text: string }>;
  subject: {
    display: string;
  };
  effectiveDateTime: string;
  issued: string;
  performer: Array<{
    display: string;
    type: string;
  }>;
  result: IObservationReference[];
  observationDetails?: string | { value: number };
}

interface IFhirDiagnosticReportResponse {
  entry: Array<{ resource: IDiagnosticReport }>;
}

export type { IDiagnosticReport, IFhirDiagnosticReportResponse };
