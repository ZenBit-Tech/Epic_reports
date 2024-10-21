import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { config } from "../config.ts";
import FhirService from "../services/fhir-epic";
import { IPatientData } from "../types/patient-data";
import { IDiagnosticReport } from "../types/diagnostic-data.ts";
import { convertDateFormat } from "../handlers/time.ts";

const { clientId, redirect, authorizeLink } = config;

const PatientInfo = () => {
  const [accessToken, setAccessToken] = useState<string>("");
  const [patient, setPatient] = useState<string>("");
  const [patientData, setPatientData] = useState<IPatientData>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [diagnosticReports, setDiagnosticReports] = useState<
    IDiagnosticReport[]
  >([]);
  const [detailsIdxToShow, setDetailsIdxToShow] = useState<number[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get("code");

    if (codeParam && !loaded) {
      const fetchAccessToken = async () => {
        try {
          const tokenData = await FhirService.login(
            clientId,
            redirect,
            codeParam
          );
          setAccessToken(tokenData.access_token);
          setPatient(tokenData.patient);
          setLoaded(true);
        } catch (error) {
          console.error("Error during login:", error);
        }
      };
      fetchAccessToken();
    }
  }, [loaded]);

  useEffect(() => {
    if (accessToken && patient) {
      const fetchPatientData = async () => {
        try {
          const data = await FhirService.getPatient(accessToken, patient);
          setPatientData(data);
        } catch (error) {
          console.error("Error fetching patient data:", error);
        }
      };

      fetchPatientData();
    }
  }, [accessToken, patient]);

  const fetchDiagnosticReport = async () => {
    if (accessToken && patient) {
      try {
        const data = await FhirService.getDiagnosticReport(
          accessToken,
          patient
        );
        const filteredReports = data.entry
          .filter((entry) => entry.resource.resourceType === "DiagnosticReport")
          .map((entry) => entry.resource);

        setDiagnosticReports(filteredReports);
      } catch (error) {
        console.error("Error fetching diagnostic report:", error);
      }
    }
  };

  const fetchObservationDetails = async (
    reportIdx: number,
    observationId: string
  ) => {
    try {
      console.log("idx", reportIdx);
      const observation = await FhirService.getObservation(
        accessToken,
        observationId
      );
      console.log("Observation Details:", observation);

      const observationDetails =
        observation?.valueQuantity ?? observation?.valueString;

      const updatedReports = diagnosticReports.map((report, index) => {
        if (index === reportIdx) {
          const observationDetails =
            observation?.valueQuantity ??
            observation?.valueString ??
            "No detailed data available";

          return {
            ...report,
            observationDetails,
          };
        }
        return report;
      });

      setDetailsIdxToShow([...detailsIdxToShow, reportIdx]);
      setDiagnosticReports(updatedReports);

      console.log("det", observationDetails);
    } catch (error) {
      console.error("Error fetching observation details:", error);
    }
  };

  console.log("diagnostic reports", diagnosticReports);
  console.log("patient data", patientData);

  return (
    <Box width="685px">
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          Patient Info
        </Typography>
        <Typography variant="subtitle1">Username: fhircamila</Typography>
        <Typography variant="subtitle1">Password: epicepic1</Typography>

        {!accessToken && (
          <Link
            href={authorizeLink}
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                marginTop: "10px",
              }}
            >
              Sign in
            </Button>
          </Link>
        )}

        {accessToken && (
          <>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table aria-label="patient information">
                <TableBody>
                  {accessToken && patientData && (
                    <>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Patient ID
                        </TableCell>
                        <TableCell align="right">{patient}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Name
                        </TableCell>
                        <TableCell align="right">
                          {patientData?.name?.[0]?.text}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Birth Date
                        </TableCell>
                        <TableCell align="right">
                          {convertDateFormat(patientData?.birthDate) || "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Gender
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            textTransform: "capitalize",
                          }}
                        >
                          {patientData?.gender}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Marital Status
                        </TableCell>
                        <TableCell align="right">
                          {patientData?.maritalStatus?.text}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Address
                        </TableCell>
                        <TableCell align="right">
                          {patientData?.address
                            ?.map(
                              (address) =>
                                `${address.line?.join(", ")}, ${
                                  address.city
                                }, ${address.state}`
                            )
                            .join("; ")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Language
                        </TableCell>
                        <TableCell align="right">
                          {
                            patientData?.communication?.[0]?.language
                              ?.coding?.[0]?.display
                          }
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          General Practitioner
                        </TableCell>
                        <TableCell align="right">
                          {patientData?.generalPractitioner?.[0]?.display}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Managing Organization
                        </TableCell>
                        <TableCell align="right">
                          {patientData?.managingOrganization?.display}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {!diagnosticReports.length && patientData && (
              <Button
                variant="outlined"
                color="primary"
                onClick={fetchDiagnosticReport}
                disabled={!accessToken}
                sx={{
                  mt: 2,
                  mr: "auto",
                }}
              >
                Diagnostic Reports
              </Button>
            )}
          </>
        )}
        {diagnosticReports.length > 0 && (
          <>
            <Typography variant="h5" marginY="30px" gutterBottom>
              Diagnostic Reports
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {diagnosticReports.map((report, index) => (
                <Card
                  key={index}
                  sx={{
                    marginBottom: "5px",
                    boxShadow: " 0 4px 8px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    padding: "20px",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      marginBottom="50px"
                    >
                      {report.code?.text || `Report ${index + 1}`}
                    </Typography>
                    <Box
                      textAlign="left"
                      display="flex"
                      flexDirection="column"
                      gap="5px"
                    >
                      <Typography variant="body1">
                        Status: {report.status}
                      </Typography>
                      <Typography variant="body1">Medical tests:</Typography>
                      <ul>
                        {report.category?.map((cat, idx) => (
                          <li key={idx}>{cat.text}</li>
                        ))}
                      </ul>

                      <Typography variant="body1">
                        Subject: {report.subject?.display || "N/A"}
                      </Typography>
                      <Typography variant="body1">
                        Effective Date:{" "}
                        {convertDateFormat(report.effectiveDateTime) || "N/A"}
                      </Typography>
                      <Typography variant="body1">
                        Issued Date: {convertDateFormat(report.issued) || "N/A"}
                      </Typography>
                      <Typography variant="body1">Performers:</Typography>
                      <ul
                        style={{
                          margin: 0,
                        }}
                      >
                        {report.performer?.map((perf, idx) => (
                          <li key={idx}>
                            {perf.display || "Unknown"} ({perf.type})
                          </li>
                        ))}
                      </ul>

                      {typeof report.observationDetails !== "string" &&
                        report?.code?.text === "Hemoglobin A1c" &&
                        report?.observationDetails?.value && (
                          <>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Details
                            </Typography>
                            <Typography variant="body1">
                              Hemoglobin A1c:{" "}
                              {`${report?.observationDetails?.value}%`}
                            </Typography>
                          </>
                        )}

                      {typeof report.observationDetails === "string" && (
                        <>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Details
                          </Typography>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: report.observationDetails
                                .replace(/\r\n/g, "<br />")
                                .replace(/·/g, "•"),
                            }}
                          />
                        </>
                      )}
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        marginTop: "20px",
                      }}
                    >
                      {!detailsIdxToShow.includes(index) &&
                        (() => {
                          const narrativeResult = report.result?.find(
                            (r) => r.display === "Narrative"
                          );
                          if (narrativeResult) {
                            return (
                              <Button
                                variant="contained"
                                key={narrativeResult.reference}
                                onClick={() =>
                                  fetchObservationDetails(
                                    index,
                                    narrativeResult.reference.split("/")[1]
                                  )
                                }
                              >
                                View Details
                              </Button>
                            );
                          } else {
                            return report.result?.map((result) => (
                              <Button
                                variant="contained"
                                key={result.reference}
                                onClick={() =>
                                  fetchObservationDetails(
                                    index,
                                    result.reference.split("/")[1]
                                  )
                                }
                              >
                                View Details
                              </Button>
                            ));
                          }
                        })()}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Box>
  );
};

export default PatientInfo;
