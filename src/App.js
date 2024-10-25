import React, { useState, useEffect } from "react";
import "./App.css";
import DischargeSummaryPDF from "./PDF";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const MultiSelect = ({ options, value, onChange, onOtherSelected }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    let newValue;
    if (option === "other") {
      newValue = value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option];
      setIsOpen(false);
      onOtherSelected();
    } else {
      newValue = value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option];
    }
    onChange(newValue);
  };

  return (
    <div className="multi-select">
      <div className="select-header" onClick={handleToggle}>
        {value.length ? value.join(", ") : "Select options"}
      </div>
      {isOpen && (
        <div className="options-container">
          {options.map((option) => (
            <div
              key={option}
              className={`option ${value.includes(option) ? "selected" : ""}`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// New InfoAlert component
const InfoAlert = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={`info-alert ${type}`}>
      {message}
    </div>
  );
};

function App() {
  const [patientInfo, setPatientInfo] = useState({
    registrationNo: "",
    name: "",
    age: "",
    gender: "",
    roomNo: "",
    admitDate: "",
    dischargeDate: "",
    address: "",
    clinicalSummary: "",
    comorbidities: [],
    comorbidityOther: "",
    diagnosis: [],
    diagnosisOther: "",
    diagnosisType: "Final",
    outcome: "",
    outcomeOther: "",
    outcomeDetails: "", // Add this new field
    conditionAtDischarge: "", // Add this new field
  });
  const [advice, setAdvice] = useState([
    { medicine: "", timesPerDay: "", numDoses: "", days: "" },
    { medicine: "", timesPerDay: "", numDoses: "", days: "" },
    { medicine: "", timesPerDay: "", numDoses: "", days: "" },
    { medicine: "", timesPerDay: "", numDoses: "", days: "" },
  ]);
  const [investigations, setInvestigations] = useState({
    mri: {
      date: "",
      report: "",
    },
    ctScan: {
      date: "",
      report: "",
    },
    csf: {
      date: "",
      report: "",
    },
    bloodWork: {
      date: "",
      hemoglobin: { value: "", unit: "g/dL" },
      whiteBloodCell: { value: "", unit: "cells/µL" },
      wbcComponents: {
        neutrophil: { value: "", unit: "%" },
        eosinophil: { value: "", unit: "%" },
        lymphocyte: { value: "", unit: "%" },
      },
      platelets: { value: "", unit: "cells/µL" },

      bloodGroup: { value: "", unit: "" },
      rhFactor: { value: "", unit: "" },
      elisaForHiv1And2: { value: "", unit: "" },
      elisaNonHcv: { value: "", unit: "" },
      australianAntigen: { value: "", unit: "" },
      bloodUrea: { value: "", unit: "mg/dL" },
      serumCreatinine: { value: "", unit: "mg/dL" },
      bloodSugar: { value: "", unit: "mg/dL" },
      srPsa: { value: "", unit: "ng/mL" },
    },
  });

  const [customBloodWork, setCustomBloodWork] = useState([]);
  const [dynamicInvestigations, setDynamicInvestigations] = useState([]);
  const [treatment, setTreatment] = useState({
    date: "",
    treatment: "",
  });
  const [searchRegistrationNo, setSearchRegistrationNo] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [bloodYes, setBloodYes] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000); // Adjust this breakpoint as needed
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAdviceChange = (index, field, value) => {
    const newAdvice = [...advice];
    newAdvice[index][field] = value;
    setAdvice(newAdvice);
  };

  const addAdviceRow = () => {
    setAdvice([
      ...advice,
      { medicine: "", timesPerDay: "", numDoses: "", days: "" },
    ]);
  };

  const togglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer);
  };

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
      ...(name === "diagnosis" && value !== "other"
        ? { diagnosisOther: "" }
        : {}),
      ...(name === "comorbidities"
        ? {
            comorbidities: Array.from(
              e.target.selectedOptions,
              (option) => option.value
            ),
          }
        : {}),
    }));
  };

  const handleComorbidityChange = (e) => {
    const { value, checked } = e.target;
    setPatientInfo((prevInfo) => {
      let updatedComorbidities = [...prevInfo.comorbidities];
      if (checked) {
        updatedComorbidities.push(value);
      } else {
        updatedComorbidities = updatedComorbidities.filter(
          (item) => item !== value
        );
      }
      return {
        ...prevInfo,
        comorbidities: updatedComorbidities,
        comorbidityOther:
          value === "Other" && !checked ? "" : prevInfo.comorbidityOther,
      };
    });
  };

  const addDynamicInvestigation = () => {
    setDynamicInvestigations([
      ...dynamicInvestigations,
      { name: "", date: "", report: "" },
    ]);
  };
  const handleInvestigationsChange = (
    investigation,
    field,
    value,
    subfield = null,
    type = null
  ) => {
    if (investigation === "bloodWork" && subfield) {
      setInvestigations((prev) => ({
        ...prev,
        bloodWork: {
          ...prev.bloodWork,
          [field]: {
            ...prev.bloodWork[field],
            [subfield]: {
              ...prev.bloodWork[field][subfield],
              [type]: value,
            },
          },
        },
      }));
      setBloodYes(true);
    } else if (investigation === "bloodWork" && type) {
      setInvestigations((prev) => ({
        ...prev,
        bloodWork: {
          ...prev.bloodWork,
          [field]: {
            ...prev.bloodWork[field],
            [type]: value,
          },
        },
      }));
      setBloodYes(true);
    } else {
      setInvestigations((prev) => ({
        ...prev,
        [investigation]: {
          ...prev[investigation],
          [field]: value,
        },
      }));
    }
  };
  const handleDynamicInvestigationChange = (index, field, value) => {
    const updatedDynamicInvestigations = [...dynamicInvestigations];
    updatedDynamicInvestigations[index] = {
      ...updatedDynamicInvestigations[index],
      [field]: value,
    };
    setDynamicInvestigations(updatedDynamicInvestigations);
  };
  console.log(dynamicInvestigations);
  const handleCustomBloodWorkChange = (index, field, value) => {
    const updatedCustomBloodWork = [...customBloodWork];
    updatedCustomBloodWork[index][field] = value;
    setCustomBloodWork(updatedCustomBloodWork);
  };

  const addCustomBloodWorkField = () => {
    setCustomBloodWork([
      ...customBloodWork,
      { parameter: "", value: "", unit: "" },
    ]);
  };

  const SelectWithOptions = ({ id, name, value, options, onChange }) => (
    <div className="input-group">
      <label htmlFor={id}>{name}:</label>
      <select
        id={id}
        value={value}
        onChange={(e) =>
          onChange("bloodWork", id, e.target.value, null, "value")
        }
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  const handleSearchChange = (e) => {
    setSearchRegistrationNo(e.target.value);
  };

  const showAlert = (message, type = 'info') => {
    setAlertInfo({ message, type });
  };

  const handleAlertClose = () => {
    setAlertInfo(null);
  };

  const handleSearch = async () => {
    if (patientInfo.registrationNo) {
      const docRef = doc(db, "patients", patientInfo.registrationNo);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPatientInfo({
          ...data.patientInfo,
        });
        setInvestigations(data.investigations);
        setTreatment(data.treatment);
        setAdvice(data.advice);
        setDynamicInvestigations(data.dynamicInvestigations);
        setCustomBloodWork(data.customBloodWork);
        setFollowUpDate(data.followUpDate);
      } else {
        showAlert("No patient found with this registration number.", "error");
        // Reset all states to their initial values
        setPatientInfo({
          registrationNo: patientInfo.registrationNo,
          name: "",
          age: "",
          gender: "",
          roomNo: "",
          admitDate: "",
          dischargeDate: "",
          address: "",
          clinicalSummary: "",
          comorbidities: [],
          comorbidityOther: "",
          diagnosis: [],
          diagnosisOther: "",
        });
        setInvestigations({
          mri: { date: "", report: "" },
          ctScan: { date: "", report: "" },
          csf: { date: "", report: "" },
          bloodWork: {
            date: "",
            hemoglobin: { value: "", unit: "g/dL" },
            whiteBloodCell: { value: "", unit: "cells/µL" },
            wbcComponents: {
              neutrophil: { value: "", unit: "%" },
              eosinophil: { value: "", unit: "%" },
              lymphocyte: { value: "", unit: "%" },
            },
            platelets: { value: "", unit: "cells/µL" },
            bloodGroup: { value: "", unit: "" },
            rhFactor: { value: "", unit: "" },
            elisaForHiv1And2: { value: "", unit: "" },
            elisaNonHcv: { value: "", unit: "" },
            australianAntigen: { value: "", unit: "" },
            bloodUrea: { value: "", unit: "mg/dL" },
            serumCreatinine: { value: "", unit: "mg/dL" },
            bloodSugar: { value: "", unit: "mg/dL" },
            srPsa: { value: "", unit: "ng/mL" },
          },
        });
        setTreatment({ date: "", treatment: "" });
        setAdvice([
          { medicine: "", timesPerDay: "", numDoses: "", days: "" },
          { medicine: "", timesPerDay: "", numDoses: "", days: "" },
          { medicine: "", timesPerDay: "", numDoses: "", days: "" },
          { medicine: "", timesPerDay: "", numDoses: "", days: "" },
        ]);
        setDynamicInvestigations([]);
        setCustomBloodWork([]);
        setFollowUpDate("");
      }
    }
  };

  const handleSave = async () => {
    const dataToSave = {
      patientInfo,
      investigations,
      treatment,
      advice,
      dynamicInvestigations,
      customBloodWork,
      followUpDate,
    };

    try {
      await setDoc(doc(db, "patients", patientInfo.registrationNo), dataToSave);
      showAlert("Data saved successfully!", "success");
    } catch (error) {
      console.error("Error saving data: ", error);
      showAlert("Error saving data. Please try again.", "error");
    }
  };

  const handleShowPDF = () => {
    if (isMobile) {
      showAlert('PDF preview is only available on desktop devices.', "info");
    } else {
      setShowPdfViewer(true);
    }
  };

  return (
    <div className="app-container">
      {alertInfo && (
        <InfoAlert
          message={alertInfo.message}
          type={alertInfo.type}
          onClose={handleAlertClose}
        />
      )}
      <div className="form-container">
        <div className="title-container">
          <h1>Discharge Summary Generator</h1>
          <div className="upper-button-container">
            <button onClick={handleShowPDF} className="beautiful-btn show-pdf-btn">
              {isMobile ? 'PDF Preview (Desktop Only)' : 'Show PDF'}
            </button>
            <button onClick={handleSave} className="beautiful-btn save-btn">
              Save
            </button>
          </div>
        </div>
        <div className="section patient-info">
          <h2>Patient Information</h2>
          <div className="patient-info-grid">
            <div className="input-group search-group">
              <label htmlFor="patientId">Registration No:</label>
              <div className="search-input-container">
                <input
                  id="patientId"
                  name="registrationNo"
                  type="text"
                  value={patientInfo.registrationNo}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter registration number"
                />
                <button onClick={handleSearch} className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                name="name"
                type="text"
                value={patientInfo.name}
                onChange={handlePatientInfoChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="age">Age:</label>
              <input
                id="age"
                name="age"
                type="text"
                value={patientInfo.age}
                onChange={handlePatientInfoChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="gender">Gender:</label>
              <select
                id="gender"
                name="gender"
                value={patientInfo.gender}
                onChange={handlePatientInfoChange}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="roomNo">Room No:</label>
              <select
                id="roomNo"
                name="roomNo"
                value={patientInfo.roomNo}
                onChange={handlePatientInfoChange}
              >
                <option value="">Select room</option>
                {[...Array(13)].map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="admitDate">Admit Date:</label>
              <input
                id="admitDate"
                name="admitDate"
                type="date"
                value={patientInfo.admitDate}
                onChange={handlePatientInfoChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="dischargeDate">Discharge Date:</label>
              <input
                id="dischargeDate"
                name="dischargeDate"
                type="date"
                value={patientInfo.dischargeDate}
                onChange={handlePatientInfoChange}
              />
            </div>
          </div>
          <div className="input-group full-width">
            <label htmlFor="address">Address:</label>
            <textarea
              id="address"
              name="address"
              value={patientInfo.address}
              onChange={handlePatientInfoChange}
            />
          </div>

          <div className="input-group full-width">
            <div className="diagnosis-header">
              <label htmlFor="diagnosis">Diagnosis:</label>
              <div className="diagnosis-type">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="diagnosisType"
                    value="Provisional"
                    checked={patientInfo.diagnosisType === "Provisional"}
                    onChange={(e) =>
                      setPatientInfo((prevInfo) => ({
                        ...prevInfo,
                        diagnosisType: e.target.value,
                      }))
                    }
                  />
                  Provisional
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="diagnosisType"
                    value="Final"
                    checked={patientInfo.diagnosisType === "Final"}
                    onChange={(e) =>
                      setPatientInfo((prevInfo) => ({
                        ...prevInfo,
                        diagnosisType: e.target.value,
                      }))
                    }
                  />
                  Final
                </label>
              </div>
            </div>
            <div className="diagnosis-container">
              <MultiSelect
                options={[
                  "Extradural Hemorrhage (EDH)",
                  "Subdural Hemorrhage (SDH)",
                  "Contusion",
                  "Intraparenchymal Bleeding",
                  "Diffuse Axonal Injury (DAI)",
                  "Cervical Spine Injury",
                  "Dorsal Spine Injury",
                  "Lumbar Spine Injury", 
                  "Prolapsed Intervertebral Disc (PIVD)",
                  "Sciatica",
                  "CVA Infarct Ischemic",
                  "CVA Hemorrhagic",
                  "Acute Bacterial Meningitis",
                  "Tuberculous Meningitis",
                  "Viral Meningitis",
                  "Encephalitis",
                  "Guillain-Barré Syndrome",
                  "Transverse Myelitis",
                  "Electrolyte Imbalance",
                  "Epilepsy"
                 ]}
                value={patientInfo.diagnosis}
                onChange={(newDiagnosis) => {
                  setPatientInfo((prevInfo) => ({
                    ...prevInfo,
                    diagnosis: newDiagnosis,
                    diagnosisOther: newDiagnosis.includes("other")
                      ? prevInfo.diagnosisOther
                      : "",
                  }));
                }}
                onOtherSelected={() => {}}
              />
            </div>
            {patientInfo.diagnosis.includes("other") && (
              <div className="input-group full-width">
                <label htmlFor="diagnosisOther">Other Diagnosis:</label>
                <input
                  id="diagnosisOther"
                  name="diagnosisOther"
                  type="text"
                  value={patientInfo.diagnosisOther}
                  onChange={handlePatientInfoChange}
                  placeholder="Enter custom diagnosis"
                />
              </div>
            )}
          </div>
          <div className="input-group full-width">
            <div className="outcome-header">
              <label>Outcome:</label>
              <div className="outcome-options">
                {["Relieved", "Cured", "Not Improved", "Referred"].map(
                  (option) => (
                    <label key={option} className="radio-label">
                      <input
                        type="radio"
                        name="outcome"
                        value={option}
                        checked={patientInfo.outcome === option}
                        onChange={(e) =>
                          setPatientInfo((prevInfo) => ({
                            ...prevInfo,
                            outcome: e.target.value,
                          }))
                        }
                      />
                      {option}
                    </label>
                  )
                )}
              </div>
            </div>
            <div className="outcome-details">
              <textarea
                id="outcomeDetails"
                name="outcomeDetails"
                value={patientInfo.outcomeDetails}
                onChange={(e) =>
                  setPatientInfo((prevInfo) => ({
                    ...prevInfo,
                    outcomeDetails: e.target.value,
                  }))
                }
                placeholder="Enter outcome details"
              />
            </div>
          </div>
          <div className="input-group full-width">
            <label htmlFor="clinicalSummary">Clinical Summary:</label>
            <textarea
              id="clinicalSummary"
              name="clinicalSummary"
              value={patientInfo.clinicalSummary}
              onChange={handlePatientInfoChange}
            />
          </div>

          <div className="input-group full-width">
            <label>Comorbidities:</label>
            <div className="checkbox-group">
              {["Diabetes", "Hypertension", "COPD", "CAD", "CKD", "Other"].map(
                (option) => (
                  <label key={option} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={option}
                      checked={patientInfo.comorbidities.includes(option)}
                      onChange={handleComorbidityChange}
                    />
                    {option}
                  </label>
                )
              )}
            </div>
          </div>

          {patientInfo.comorbidities.includes("Other") && (
            <div className="input-group full-width">
              <label htmlFor="comorbidityOther">Other Comorbidities:</label>
              <input
                id="comorbidityOther"
                name="comorbidityOther"
                type="text"
                value={patientInfo.comorbidityOther}
                onChange={handlePatientInfoChange}
                placeholder="Enter other comorbidities"
              />
            </div>
          )}
        </div>

        <div className="section investigations">
          <h2>Investigations</h2>

          <div className="subsection mri">
            <h3>MRI</h3>
            <div className="input-group">
              <label htmlFor="mriDate">Date:</label>
              <input
                id="mriDate"
                type="date"
                value={investigations.mri.date}
                onChange={(e) =>
                  handleInvestigationsChange("mri", "date", e.target.value)
                }
              />
            </div>
            <div className="input-group full-width">
              <label htmlFor="mriReport">Report:</label>
              <textarea
                id="mriReport"
                value={investigations.mri.report}
                onChange={(e) =>
                  handleInvestigationsChange("mri", "report", e.target.value)
                }
              />
            </div>
          </div>

          <div className="subsection ctScan">
            <h3>CT Scan</h3>
            <div className="input-group">
              <label htmlFor="ctScanDate">Date:</label>
              <input
                id="ctScanDate"
                type="date"
                value={investigations.ctScan.date}
                onChange={(e) =>
                  handleInvestigationsChange("ctScan", "date", e.target.value)
                }
              />
            </div>
            <div className="input-group full-width">
              <label htmlFor="ctScanReport">Report:</label>
              <textarea
                id="ctScanReport"
                value={investigations.ctScan.report}
                onChange={(e) =>
                  handleInvestigationsChange("ctScan", "report", e.target.value)
                }
              />
            </div>
          </div>

          <div className="subsection csf">
            <h3>CSF</h3>
            <div className="input-group">
              <label htmlFor="csfDate">Date:</label>
              <input
                id="csfDate"
                type="date"
                value={investigations.csf.date}
                onChange={(e) =>
                  handleInvestigationsChange("csf", "date", e.target.value)
                }
              />
            </div>
            <div className="input-group full-width">
              <label htmlFor="csfReport">Report:</label>
              <textarea
                id="csfReport"
                value={investigations.csf.report}
                onChange={(e) =>
                  handleInvestigationsChange("csf", "report", e.target.value)
                }
              />
            </div>
          </div>

          <div className="subsection dynamic-investigations">
            <h3>Additional Investigations</h3>
            {dynamicInvestigations.map((investigation, index) => (
              <div key={index} className="dynamic-investigation">
                <div className="input-group">
                  <label htmlFor={`investigation-name-${index}`}>
                    Investigation Name:
                  </label>
                  <input
                    id={`investigation-name-${index}`}
                    type="text"
                    value={investigation.name}
                    onChange={(e) =>
                      handleDynamicInvestigationChange(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="input-group">
                  <label htmlFor={`investigation-date-${index}`}>Date:</label>
                  <input
                    id={`investigation-date-${index}`}
                    type="date"
                    value={investigation.date}
                    onChange={(e) =>
                      handleDynamicInvestigationChange(
                        index,
                        "date",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="input-group full-width">
                  <label htmlFor={`investigation-report-${index}`}>
                    Report:
                  </label>
                  <textarea
                    id={`investigation-report-${index}`}
                    value={investigation.report}
                    onChange={(e) =>
                      handleDynamicInvestigationChange(
                        index,
                        "report",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addDynamicInvestigation}
              className="add-investigation-btn"
            >
              + Add Investigation Parameter
            </button>
          </div>
          <div className="subsection blood-work">
            <h3>Blood Report</h3>
            <div className="input-group">
              <label htmlFor="bloodWorkDate">Date:</label>
              <input
                id="bloodWorkDate"
                type="date"
                value={investigations.bloodWork.date}
                onChange={(e) =>
                  handleInvestigationsChange(
                    "bloodWork",
                    "date",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="blood-work-grid">
              {Object.entries(investigations.bloodWork)
                .filter(([key]) => key !== "wbcComponents" && key !== "date")
                .map(([key, { value, unit }]) => {
                  if (
                    [
                      "elisaForHiv1And2",
                      "elisaNonHcv",
                      "australianAntigen",
                      "rhFactor",
                      "bloodGroup",
                    ].includes(key)
                  ) {
                    const options =
                      key !== "rhFactor" && key !== "bloodGroup"
                        ? ["Reactive", "Non-Reactive"]
                        : key === "rhFactor"
                        ? ["Positive", "Negative"]
                        : ["A", "B", "AB", "O"];
                    return (
                      <SelectWithOptions
                        key={key}
                        id={key}
                        name={key
                          .replace(/([A-Z0-9])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                        value={value}
                        options={options}
                        onChange={handleInvestigationsChange}
                      />
                    );
                  } else {
                    return (
                      <div className="input-group" key={key}>
                        <label htmlFor={key}>
                          {key === "srPsa"
                            ? "Sr PSA"
                            : key
                                .replace(/([A-Z0-9])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                          :
                        </label>
                        <div className="value-unit-group">
                          <input
                            id={`${key}-value`}
                            type="text"
                            value={value}
                            onChange={(e) =>
                              handleInvestigationsChange(
                                "bloodWork",
                                key,
                                e.target.value,
                                null,
                                "value"
                              )
                            }
                          />
                          <input
                            id={`${key}-unit`}
                            type="text"
                            value={unit}
                            onChange={(e) =>
                              handleInvestigationsChange(
                                "bloodWork",
                                key,
                                e.target.value,
                                null,
                                "unit"
                              )
                            }
                            className="unit-input"
                          />
                        </div>
                      </div>
                    );
                  }
                })}
            </div>

            {customBloodWork.map((param, index) => (
              <div key={index} className="custom-blood-work-row">
                <input
                  type="text"
                  placeholder="Parameter"
                  value={param.parameter}
                  onChange={(e) =>
                    handleCustomBloodWorkChange(
                      index,
                      "parameter",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Value"
                  className="customValue"
                  value={param.value}
                  onChange={(e) =>
                    handleCustomBloodWorkChange(index, "value", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Unit"
                  className="customUnit"
                  value={param.unit}
                  onChange={(e) =>
                    handleCustomBloodWorkChange(index, "unit", e.target.value)
                  }
                />
              </div>
            ))}
            <button
              onClick={addCustomBloodWorkField}
              className="add-parameter-btn"
            >
              + Add Blood Parameter
            </button>
          </div>
        </div>

        <div className="section">
          <h2>Treatment/Surgery</h2>
          <div className="input-group treatmentgroup">
            <label>Date:</label>
            <input
              id="treatmentDate"
              type="date"
              value={treatment.date}
              onChange={(e) =>
                setTreatment({ ...treatment, date: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label>Report:</label>
            <textarea
              id="treatmentReport"
              type="text"
              value={treatment.treatment}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  treatment: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Add the new Condition at Discharge section */}
        <div className="section">
          <h2>Condition at Discharge</h2>
          <div className="input-group">
            <textarea
              id="conditionAtDischarge"
              name="conditionAtDischarge"
              value={patientInfo.conditionAtDischarge}
              onChange={(e) =>
                setPatientInfo((prevInfo) => ({
                  ...prevInfo,
                  conditionAtDischarge: e.target.value,
                }))
              }
              placeholder="Enter condition at discharge"
            />
          </div>
        </div>

        <div className="section">
          <h2>Advice</h2>
          <div className="advice-grid">
            {advice.map((item, index) => (
              <div key={index} className="advice-row">
                <div className="input-group medicine">
                  <input
                    type="text"
                    placeholder="Medicine/Advice"
                    value={item.medicine}
                    list="medicationList"
                    onChange={(e) =>
                      handleAdviceChange(index, "medicine", e.target.value)
                    }
                  />
                  <datalist id="medicationList">
                    <option value="Inj Cezsal 1.5 gm IV" />
                    <option value="Inj Cefobita 1.5 gm IV" />
                    <option value="Inj Pipzo 4.5 gm IV with 100ml NS" />
                    <option value="Inj Meropenem 1 gm IV with 100ml NS" />
                    <option value="Inj Effectal S 1.125 gm IV" />
                    <option value="Inj Amikacin 500 mg IV" />
                    <option value="Inj Aquadal Aq IV" />
                    <option value="Tab Levofloxacin 500 mg" />
                    <option value="Tab Clavox 625 mg" />
                    <option value="Tab Spaflam" />
                    <option value="Inj Clindamycin 300 mg IV with 100ml NS" />
                    <option value="Tab Omeprazole 20 mg" />
                    <option value="Tab Pantaprazole 80 mg" />
                    <option value="Tab Rabeprazole 20 mg" />
                    <option value="Tab Hifenac P" />
                    <option value="Inj Cefoperazone + Salbactum 1.5 gm IV" />
                  </datalist>
                </div>
                <div className="input-group dosage">
                  <input
                    type="number"
                    placeholder="Times/day"
                    value={item.timesPerDay}
                    onChange={(e) =>
                      handleAdviceChange(index, "timesPerDay", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Doses"
                    value={item.numDoses}
                    onChange={(e) =>
                      handleAdviceChange(index, "numDoses", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Days"
                    value={item.days}
                    onChange={(e) =>
                      handleAdviceChange(index, "days", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <button onClick={addAdviceRow} className="add-advice-btn">
            + Add Advice
          </button>
        </div>

        <div className="section">
          <h2>Follow-up</h2>
          <div className="input-group">
            <label htmlFor="followUpDate">Next Follow-up Date:</label>
            <input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>
        </div>

        <div className="button-container">
          <PDFDownloadLink
            document={
              <DischargeSummaryPDF
                patientInfo={patientInfo}
                investigations={investigations}
                treatment={treatment}
                advice={advice}
                dynamicInvestigations={dynamicInvestigations}
                customBloodWork={customBloodWork}
                followUpDate={followUpDate}
                bloodYes={bloodYes}
              />
            }
            fileName="discharge_summary.pdf"
            className="beautiful-btn preview-pdf-btn pdf-download-link"
          >
            {({ blob, url, loading, error }) =>
              loading ? "Loading document..." : "Generate PDF"
            }
          </PDFDownloadLink>
          <button onClick={handleShowPDF} className="beautiful-btn show-pdf-btn">
            {isMobile ? 'PDF Preview (Desktop Only)' : 'Show PDF'}
          </button>
          <button onClick={handleSave} className="beautiful-btn save-btn">
            Save
          </button>
        </div>
      </div>

      {showPdfViewer && (
        <div className="pdf-viewer-container">
          <PDFViewer width="100%" height="100%">
            <DischargeSummaryPDF
              patientInfo={patientInfo}
              investigations={investigations}
              treatment={treatment}
              advice={advice}
              dynamicInvestigations={dynamicInvestigations}
              customBloodWork={customBloodWork}
              followUpDate={followUpDate}
              bloodYes={bloodYes}
            />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}

export default App;
