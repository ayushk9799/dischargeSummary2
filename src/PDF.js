import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import tinos from "./fonts/Tinos-Regular.ttf";
import notoSansDevanagari from "./fonts/NotoSansDevanagari-Regular.ttf";
// Create styles
Font.register({
  family: "Tinos",
  src: tinos,
  fontWeight: "normal",
});

Font.register({
  family: "NotoSansDevanagari",
  src: notoSansDevanagari,
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 60, // Add padding at the bottom to accommodate the footer
  },
  header: {
    marginBottom: 10,
  },
  samagamContainer: {
    textAlign: "right",
  },
  samagamName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#003366",
  },
  headerContainer: {
    height: 75,
    position: "relative",
  },

  logoContainer: {
    position: "absolute",
    top: 0, // Adjust this to position the logo properly
    left: 0,
    width: 120,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 100,
    height: "auto",
  },

  clinicNameContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#000080",
    padding: 5,
    height: 55,
    zIndex: 5,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  superSpeciality: {
    fontWeight: "extrabold",
    color: "#ffffff",
    textAlign: "right",
    fontSize: 25,
    transform: "scaleY(1.5)",
  },
  contactInfo: {
    fontSize: 15,
    color: "#ffffff",
    backgroundColor: "#ff0000",
    padding: 2,
    marginTop: 5,
    fontFamily: "NotoSansDevanagari",
    textAlign: "center",
  },
  doctorInfo: {
    alignItems: "center",
    marginBottom: 5,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff0000",
  },
  specialization: {
    fontSize: 14,
    marginBottom: 2,
  },
  position: {
    fontSize: 12,
    marginBottom: 2,
  },
  regNo: {
    fontSize: 12,
  },
  dischargeSummary: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#000080",
    padding: 5,
    textAlign: "center",
  },
  title: {
    fontSize: 15,
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    letterSpacing: 2,
    padding: 2,
  },
  section: {
    padding: 3,
    marginLeft: 10,
  },
  sectionContent: {
    marginLeft: 5, // Indent the content
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bolder",
  },
  text: {
    fontFamily: "Tinos",
    fontSize: 11,

    marginBottom: 3,
  },
  patientInfoGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  patientInfoItem: {
    width: "33%",
    marginBottom: 5,
  },

  subsection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  summary: {
    display: "flex",
    flexDirection: "row",
    columnGap: 60,
  },
  reportText: {
    flex: 1,
  },
  fullWidth: {
    width: "100%",
  },
  investigationSubsection: {
    display: "flex",
    flexDirection: "row",
    columnGap: 65,
    marginBottom: 5,
    marginLeft: 10,
    borderBottom: "1 solid #cccccc",
  },
  bloodSection: {
    marginLeft: 10,
    borderBottom: "1 solid #cccccc",
    marginBottom: 10,
  },
  investigationTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    textDecoration: "underline",
  },
  investigationItem: {
    display: "flex",
    flexDirection: "row",

    // justifyContent: "space-between",
    marginBottom: 2,
    marginLeft: 130,
    border: 1,
    borderColor: "black",
  },
  investigationLabel: {
    fontSize: 10,
    fontFamily: "Tinos",
    flex: 1,
  },
  investigationBelow: {
    marginBottom: 10,
  },
  investigationValue: {
    fontSize: 10,
    flex: 1,
    textAlign: "right",
  },
  header: {
    marginBottom: 10,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "red",
    padding: 5,
  },
  footerText: {
    color: "white",
    fontSize: 11,
    textAlign: "center",
    fontFamily: "NotoSansDevanagari",
  },
  contentWrapper: {
    flex: 1,
  },
});

const renderBloodReport = (bloodWorkArray, customBloodWork) => {
  let one = [];
  let two = [];
  console.log(bloodWorkArray);
  bloodWorkArray.forEach(([key, value]) => {
    if (key === "wbcComponents") {
      Object.entries(value).forEach(([wbcComponents, wbcComponentsValue]) => {
        if (wbcComponentsValue.value !== "") {
          one.push([wbcComponents, wbcComponentsValue]);
        }
      });
    } else {
      if (value.value !== "") {
        if (one.length < 9) {
          one.push([key, value]);
        } else {
          two.push([key, value]);
        }
      }
    }
  });
  customBloodWork.forEach((customBloods) => {
    if (two.length !== 0) {
      two.push([
        customBloods.parameter,
        { value: customBloods.value, unit: customBloods.unit },
      ]);
    } else {
      one.push([
        customBloods.parameter,
        { value: customBloods.value, unit: customBloods.unit },
      ]);
    }
  });
  console.log(one);
  console.log(two);
  if (two.length !== 0) {
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          columnGap: 50,
          marginLeft: 10,
        }}
      >
        <View style={{ width: "50%" }}>
          {one.map(
            ([key, value]) =>
              value.value !== "" && (
                <View
                  key={key}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Tinos" }}>
                      {key === "srPsa"
                        ? "Sr PSA"
                        : key
                            ?.replace(/([A-Z0-9])/g, " $1")
                            ?.replace(/^./, (str) => str.toUpperCase())}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Tinos",
                        textIndent: 5,
                      }}
                    >
                      {value.value}
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: "Tinos" }}>
                      {value.unit}
                    </Text>
                  </View>
                </View>
              )
          )}
        </View>
        <View style={{ width: "50%" }}>
          {two.map(
            ([key, value]) =>
              value.value !== "" && (
                <View
                  key={key}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Tinos" }}>
                      {key === "srPsa"
                        ? "Sr PSA"
                        : key
                            ?.replace(/([A-Z0-9])/g, " $1")
                            ?.replace(/^./, (str) => str.toUpperCase())}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Tinos",
                        textIndent: 5,
                      }}
                    >
                      {value.value}
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: "Tinos" }}>
                      {value.unit}
                    </Text>
                  </View>
                </View>
              )
          )}
        </View>
      </View>
    );
  } else {
    return (
      <View>
        {one.map(([key, value]) => (
          <View
            key={key}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginLeft: 130,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontFamily: "Tinos" }}>
                {key === "srPsa"
                  ? "Sr PSA"
                  : key
                      ?.replace(/([A-Z0-9])/g, " $1")
                      ?.replace(/^./, (str) => str.toUpperCase())}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontSize: 10, fontFamily: "Tinos", textIndent: 5 }}
              >
                {value.value}
              </Text>
              <Text style={{ fontSize: 10, fontFamily: "Tinos" }}>
                {value.unit}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
};
const renderInvestigationSection = (report, date, label) => {
  console.log(report);
  if (!report) return null;

  const formattedDate = date ? date.split("-").reverse().join("-") : null;
  const styleWithDate = {
    display: "flex",
    flexDirection: "row",
    marginBottom: 5,
    marginLeft: 10,
    borderBottom: "1 solid #cccccc",
  };

  const styleWithoutDate = {
    display: "flex",
    flexDirection: "row",

    marginBottom: 5,
    marginLeft: 10,
    borderBottom: "1 solid #cccccc",
  };

  return (
    <View style={formattedDate ? styleWithDate : styleWithoutDate}>
      <View style={[styles.text, styles.boldText, { width: 130 }]}>
        <Text>
          {label} {formattedDate && `(${formattedDate})`}:
        </Text>
      </View>

      <View style={styles.reportText}>
        <Text style={styles.text}>{report}</Text>
      </View>
    </View>
  );
};
// Create Document Component
const DischargeSummaryPDF = ({
  patientInfo,
  investigations,
  treatment,
  advice,
  dynamicInvestigations,
  customBloodWork,
  followUpDate,
  bloodYes,
}) => {
  console.log(patientInfo);
  console.log(patientInfo.conditionAtDischarge);
  console.log(bloodYes);
  const formatDiagnosis = () => {
    const mainDiagnoses = patientInfo.diagnosis.filter((d) => d !== "other");
    const otherDiagnosis = patientInfo.diagnosisOther
      ? [patientInfo.diagnosisOther]
      : [];
    const allDiagnoses = [...mainDiagnoses, ...otherDiagnosis];

    if (allDiagnoses.length === 0) return "";
    if (allDiagnoses.length === 1) return allDiagnoses[0];
    if (allDiagnoses.length === 2) return allDiagnoses.join(" and ");
    return (
      allDiagnoses.slice(0, -1).join(", ") + ", and " + allDiagnoses.slice(-1)
    );
  };

  const DischargeSummaryHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContainer}>
        <View style={styles.samagamContainer}>
          <Text style={styles.samagamName}>SAMAGAM HEALTH CARE</Text>
        </View>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={require("./logo.png")} />
        </View>
        <View style={styles.clinicNameContainer}>
          <Text style={styles.superSpeciality}>
            PARIDHI SUPER SPECIALITY CLINIC
          </Text>
        </View>
      </View>
      <Text style={styles.contactInfo}>
        मानिक सरकार चौक, दुर्गाबाड़ी के पास, मशाकचक, भागलपुर मो० : 8877909090,
        9835294797
      </Text>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>Dr. (Prof.) Pankaj Kumar</Text>
        <Text style={styles.specialization}>M.Ch (Neurosurgery)</Text>
        <Text
          style={[styles.specialization, { fontFamily: "NotoSansDevanagari" }]}
        >
          न्यूरोसर्जन
        </Text>
        <Text style={styles.position}>
          Professor & HOD Neurosurgery, JLNMCH, Bhagalpur
        </Text>
        <Text style={styles.regNo}>Reg. No. - JMC340</Text>
      </View>
      <Text style={styles.dischargeSummary}>DISCHARGE SUMMARY</Text>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        आप अन्यत्र सलाह लेने के लिए स्वतंत्र हैं। 15 दिनों बाद पुनः फीस लगेगा।
        पुराना चिट्ठा संध्या में दिखावें। Not for Medico Legal Purpose.
      </Text>
    </View>
  );

  const OutcomeCheckbox = ({ label, checked }) => (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: "black",
          backgroundColor: checked ? "black" : "white",
          marginRight: 5,
        }}
      />
      <Text style={styles.text}>{label}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.contentWrapper}>
          <DischargeSummaryHeader />
          <View style={{ marginLeft: 10, paddingLeft: 3 }}>
            <View style={styles.patientInfoGrid}>
              <View style={styles.patientInfoItem}>
                <Text style={styles.text}>Name: {patientInfo.name}</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.text}>
                  Age/Sex: {patientInfo.age} yrs /{patientInfo.gender}
                </Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.text}>
                  DOA: {patientInfo.admitDate.split("-").reverse().join("-")}
                </Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.text}>
                  DOD:{" "}
                  {patientInfo.dischargeDate.split("-").reverse().join("-")}
                </Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.text}>
                  Reg. No.: {patientInfo.registrationNo}
                </Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.text}>Room No: {patientInfo.roomNo}</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.text}>Address: {patientInfo.address}</Text>
              </View>
            </View>
          </View>

          {
            <View style={{ marginLeft: 10, paddingLeft: 3 }}>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View style={{ width: 145 }}>
                  <Text style={styles.sectionTitle}>
                    DIAGNOSIS ({patientInfo.diagnosisType}):
                  </Text>
                </View>
                <View>
                  <Text style={styles.text}>{formatDiagnosis()}</Text>
                </View>
              </View>
            </View>
          }

          <View style={{ marginLeft: 10, paddingLeft: 3, marginTop: 5 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ width: 145 }}>
                <Text style={styles.sectionTitle}>OUTCOME:</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <OutcomeCheckbox
                  label="Relieved"
                  checked={patientInfo.outcome === "Relieved"}
                />
                <OutcomeCheckbox
                  label="Cured"
                  checked={patientInfo.outcome === "Cured"}
                />
                <OutcomeCheckbox
                  label="Not Improved"
                  checked={patientInfo.outcome === "Not Improved"}
                />
                <OutcomeCheckbox
                  label="Referred"
                  checked={patientInfo.outcome === "Referred"}
                />
              </View>
            </View>
            {patientInfo.outcomeDetails && (
              <View style={{ marginLeft: 145, marginTop: 5 }}>
                <Text style={styles.text}>{patientInfo.outcomeDetails}</Text>
              </View>
            )}
          </View>

          {(patientInfo.clinicalSummary ||
            patientInfo.comorbidities.length > 0) && (
            <View style={styles.section}>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View style={{ width: 145 }}>
                  <Text style={styles.sectionTitle}>CLINICAL SUMMARY:</Text>
                </View>
                <View>
                  <Text style={styles.text}>
                    {patientInfo.clinicalSummary}
                    {patientInfo.comorbidities.length > 0 &&
                      `, ${patientInfo.comorbidities
                        .filter((value) => value !== "Other")
                        .join(", ")}${
                        patientInfo.comorbidities.includes("Other")
                          ? `, ${patientInfo.comorbidityOther}`
                          : ""
                      }`}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
              INVESTIGATION:
            </Text>
            <View style={styles.sectionContent}>
              {renderInvestigationSection(
                investigations.mri.report,
                investigations.mri.date,
                "MRI"
              )}
              {renderInvestigationSection(
                investigations.ctScan.report,
                investigations.ctScan.date,
                "CT Scan"
              )}
              {renderInvestigationSection(
                investigations.csf.report,
                investigations.csf.date,
                "CSF"
              )}
              {bloodYes && (
                <View style={styles.bloodSection}>
                  <Text style={[styles.text, styles.boldText]}>
                    BLOOD REPORT (
                    {investigations.bloodWork.date
                      .split("-")
                      .reverse()
                      .join("-")}
                    ):
                  </Text>
                  {renderBloodReport(
                    Object.entries(investigations.bloodWork).filter(
                      ([key]) => key !== "date"
                    ),
                    customBloodWork
                  )}
                </View>
              )}
              {dynamicInvestigations.map((dinvestigations) =>
                renderInvestigationSection(
                  dinvestigations.report,
                  dinvestigations.date,
                  dinvestigations.name
                )
              )}
            </View>
          </View>

          <View
            style={[styles.section, { display: "flex", flexDirection: "row" }]}
          >
            <View style={{ width: 145 }}>
              <Text style={styles.sectionTitle}>
                {treatment.treatment ? "TREATMENT:" : ""}
              </Text>
              <Text style={styles.text}>
                {treatment.date
                  ? `(${treatment.date.split("-").reverse().join("-")})`
                  : ""}
              </Text>
            </View>

            <View style={styles.reportText}>
              <Text style={styles.text}>{treatment.treatment}</Text>
            </View>
          </View>

          {patientInfo.conditionAtDischarge && (
            <View
              style={[
                styles.section,
                { display: "flex", flexDirection: "row" },
              ]}
            >
              <View style={{ width: 145 }}>
                <Text style={styles.sectionTitle}>DISCHARGE CONDITION:</Text>
              </View>
              <View style={styles.reportText}>
                <Text style={styles.text}>
                  {patientInfo.conditionAtDischarge}
                </Text>
              </View>
            </View>
          )}

          <View
            style={[styles.section, { display: "flex", flexDirection: "row" }]}
          >
            <View style={{ width: 145 }}>
              <Text style={styles.sectionTitle}>ADVICE:</Text>
            </View>
            <View style={[styles.reportText]}>
              {advice.map(
                (item, index) =>
                  item.medicine !== "" && (
                    <View
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.text}>
                          {index + 1}. {item.medicine}
                        </Text>
                      </View>
                      {item.timesPerDay && item.numDoses && item.days && (
                        <View>
                          <Text style={styles.text}>
                            {item.timesPerDay} x {item.numDoses}- {item.days}{" "}
                            days
                          </Text>
                        </View>
                      )}
                    </View>
                  )
              )}
            </View>
          </View>

          {followUpDate && (
            <View
              style={[
                styles.section,
                { display: "flex", flexDirection: "row" },
              ]}
            >
              <View style={{ width: 145 }}>
                <Text style={styles.sectionTitle}>FOLLOW-UP:</Text>
              </View>
              <View style={[styles.reportText]}>
                <Text style={styles.text}>
                  Next Follow-up Date:{" "}
                  {followUpDate.split("-").reverse().join("-")}
                </Text>
              </View>
            </View>
          )}
        </View>
        <Footer />

        {/* Add this new View for signatures */}
        <View
          style={{
            position: "absolute",
            bottom: 50, // Adjust this value to position above the footer
            left: 20,
            right: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: "45%", textAlign: "left" }}>
            <Text style={{ fontSize: 14, fontWeight: "hairline" }}>
              Signature of Junior Doctor
            </Text>
          </View>
          <View style={{ width: "45%", textAlign: "right" }}>
            <Text style={{ fontSize: 14, fontWeight: "hairline" }}>
              Signature of Senior Doctor
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DischargeSummaryPDF;
