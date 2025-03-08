"use client";

import { useState, useEffect } from "react";
import FHIR from "fhirclient";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const conditionCodes = ["38341003", "267432004", "44054006", "13645005"];





export default function PatientSelectPage() {
    const [patients, setPatients] = useState<Array<{ 
    id: string; 
    name: string; 
    birthDate: string; 
    gender: string; 
    conditions: any[]; 
    observations: any[];
}>>([]);


// 🔹 Place this at the top of the file, BEFORE the main component function
const renderPatientQualifications = (selectedPatient: any): JSX.Element => {
    if (!selectedPatient) return <div key="empty"></div>; // ✅ Always returns valid JSX

    const heightObs = selectedPatient.observations?.find((obs: any) => obs.code === "8302-2"); // LOINC Code for Height
    const weightObs = selectedPatient.observations?.find((obs: any) => obs.code === "29463-7"); // LOINC Code for Weight

    const height = heightObs ? parseFloat(heightObs.value) : null;
    const weight = weightObs ? parseFloat(weightObs.value) : null;

    // Calculate BMI: BMI = (weight in lbs * 703) / (height in inches)^2
    const bmi = height && weight ? ((weight * 703) / (height * height)).toFixed(1) : "Unknown";

    const hasRPMCondition = selectedPatient.conditions.some((condition: any) =>
        ["38341003", "13645005"].includes(condition.code)
    );
    const hasRTMCondition = selectedPatient.conditions.some((condition: any) =>
        condition.code === "13645005"
    );

    let qualifyingConditions = selectedPatient.conditions.length;
    if (bmi !== "Unknown" && parseFloat(bmi) >= 25) {
        qualifyingConditions += 1;
    }

    return (
        <div key="qualifications"> 
            <br />
            {hasRPMCondition && <p className="text-green-600 font-semibold">RPM Qualified. $90 - $150/month</p>}
            {hasRTMCondition && <p className="text-green-600 font-semibold">RTM Qualified. $50 - $150/month</p>}
            {qualifyingConditions > 1 && <p className="text-green-600 font-semibold">CCM Qualified. $60 - $150/month</p>}
        </div>
    );
};





    const [selectedPatient, setSelectedPatient] = useState<{ 
    id: string;
    name: string;
    birthDate: string;
    gender: string;
    conditions: any[];
    observations: any[];
} | null>(null);

    const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());











    
    useEffect(() => {
    const fetchPatients = async () => {
        try {
            const client = await FHIR.oauth2.ready();
            const fhirUrl = client.state.serverUrl;
            const accessToken = client.state.tokenResponse?.access_token;

            if (!fhirUrl || !accessToken) {
                console.error("❌ Missing FHIR server URL or access token.");
                return;
            }

            const conditionCodes = ["38341003", "267432004", "44054006", "13645005"];
            const conditionQuery = conditionCodes.map(code => `code=${code}`).join("&");

            // **Step 1: Fetch Patients from Condition Search**
            const conditionResponse = await client.request({
                url: `${fhirUrl}/Condition?${conditionQuery}&_count=100`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            //console.log("📌 DEBUG: Condition API Response", conditionResponse);

            if (!conditionResponse.entry) {
                console.error("❌ No patients found for the specified conditions.");
                return;
            }

            // **Extract Unique Patient IDs from Condition Response**
            const patientIds = [
                ...new Set(
                    conditionResponse.entry
                        .map(entry => entry.resource.subject?.reference?.split("/")[1])
                        .filter(Boolean) // Remove undefined/null values
                ),
            ];

            //console.log("✅ DEBUG: Extracted Patient IDs", patientIds);

            // **Step 2: Fetch Patient Details**
            const patientRequests = patientIds.map(id =>
                client.request({
                    url: `${fhirUrl}/Patient/${id}`,
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
            );

            const patientResponses = await Promise.all(patientRequests);
            //console.log("📌 DEBUG: Patient API Response", patientResponses);

            // **Step 3: Fetch Conditions for Each Patient**
            const conditionRequests = patientIds.map(id =>
                client.request({
                    url: `${fhirUrl}/Condition?patient=${id}`,
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
            );

            const conditionResponses = await Promise.all(conditionRequests);
            //console.log("📌 DEBUG: Individual Patient Conditions", conditionResponses);

            // **Step 4: Fetch Observations (Vitals & Labs)**
            const observationRequests = patientIds.map(id =>
                client.request({
                    url: `${fhirUrl}/Observation?patient=${id}&_count=50`, // Limit to 20 observations per patient
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
            );

            const observationResponses = await Promise.all(observationRequests);
            //console.log("📌 DEBUG: Individual Patient Observations", observationResponses);

            // **Step 5: Format the Data for UI**
            const formattedPatients = patientResponses.map((patient, index) => {
                const patientId = patient.id;

                return {
                    id: patientId,
                    name: patient.name ? `${patient.name[0]?.family}, ${patient.name[0]?.given?.join(" ")}` : "Unknown Name",
                    birthDate: patient.birthDate || "Unknown",
                    gender: patient.gender || "Unknown",
                    conditions: conditionResponses[index]?.entry?.map(entry => ({
                        code: entry.resource.code?.coding?.[0]?.code || "Unknown",
                        display: entry.resource.code?.coding?.[0]?.display || "Unknown Condition",
                    })) || [],
                    observations: observationResponses[index]?.entry?.map(entry => ({
                        code: entry.resource.code?.coding?.[0]?.code || "Unknown",
                        display: entry.resource.code?.coding?.[0]?.display || "Unknown Observation",
                        value: entry.resource.valueQuantity?.value || "N/A",
                        unit: entry.resource.valueQuantity?.unit || "",
                        effectiveDate: entry.resource.effectiveDateTime || "Unknown",


                    })) || [],
                };
            });

            // **Sort patients alphabetically**
            formattedPatients.sort((a, b) => a.name.localeCompare(b.name));

            // **Update UI**
            setPatients(formattedPatients);
        } catch (error) {
            console.error("❌ Error fetching patients, conditions, or observations:", error);
        }
    };

    fetchPatients();
}, []);

  const [message, setMessage] = useState(""); // State for displaying messages

const handleSubmit = async () => {
    if (selectedPatients.size === 0) {
        setMessage("You need to select at least one patient to build a care plan.");
        return;
    }

    setMessage("Your patients have been submitted, in about five minutes their care plans will be available in the EHR.");

    const payload = {
    patientIDs: Array.from(selectedPatients), // No need to map, since it's already a Set<string>
};


        const response = await fetch("https://wjjfvyu7kk.execute-api.us-east-1.amazonaws.com/api/emr/meldrx/bulkcareplan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        

};



    const togglePatientSelection = (id: string) => {
    const updatedSelection = new Set(selectedPatients);
    if (updatedSelection.has(id)) {
        updatedSelection.delete(id);
    } else {
        updatedSelection.add(id);
    }
    setSelectedPatients(updatedSelection);
};

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-6 mt-24">
                <h1 className="text-2xl font-bold mb-2">Build Patient Careplans</h1>
                <p className="text-lg mb-6">Select patients for care plan creation</p>
                <div className="grid grid-cols-12 gap-4">
                    
                    <div className="col-span-4 bg-white p-4 rounded-lg shadow-md overflow-y-auto h-[36rem]">
                        <h2 className="text-lg font-semibold mb-2">Patients</h2>
                        <ul>
                            {patients.map((patient) => (
                                <li key={patient.id} className="flex items-center gap-2 p-2 border-b cursor-pointer hover:bg-gray-100" onClick={() => setSelectedPatient(patient)}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPatients.has(patient.id)}
                                        onChange={() => togglePatientSelection(String(patient.id))}
                                        className="form-checkbox"
                                    />
                                    <span className="text-left">{patient.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    
                    <div className="col-span-6 bg-white p-4 rounded-lg shadow-md h-[36rem]">
                        <h2 className="text-lg font-semibold">Patient Details</h2>
                        {selectedPatient ? (
                            <div className="mt-4">
                               
                                {(() => {
    const [lastName, firstName] = selectedPatient.name.split(", ");
    return <p className="text-green-600 text-lg font-semibold"><strong>{firstName} {lastName}</strong> </p>;
})()}



                                <p>[DOB: {(() => {
    if (!selectedPatient.birthDate) return "Unknown";

    const [year, month, day] = selectedPatient.birthDate.split("-");
    return `${parseInt(month)}-${parseInt(day)}-${year}`; 
})()}]</p>
<br/>
                            
                                



          








          


          {(() => {
    const friendlyNames = {
        "2708-6": "OxSat",
        "13457-7": "LDL",
        "67816": "HDL",
        "17856-6": "A1C",
        "85354-9": "Blood Pressure"
    };

    const latestObservations = {};

    // Sort observations by effectiveDateTime (newest first)
const sortedObservations = [...selectedPatient.observations]
    .filter(obs => obs.code !== "8302-2" && obs.code !== "29463-7") // Exclude Height & Weight
    .sort((a, b) => new Date(b.effectiveDateTime).getTime() - new Date(a.effectiveDateTime).getTime());

    // Extract only the latest observation for each type
    for (const obs of sortedObservations) {
        if (!latestObservations[obs.code]) {
            latestObservations[obs.code] = obs;
        }
    }

    return null;  // <-- Fix: JSX requires a return type
})()}
                            </div>
                        ) : (
                            <p className="mt-4 text-gray-500">Select a patient to view details</p>
                        )}
                    </div>
                    
                    
                    <div className="col-span-2 bg-gray-200 p-4 rounded-lg shadow-md h-[36rem]">
                        <h2 className="text-xl font-semibold">Actions</h2>
                        <button className="mt-4 px-4 py-2 bg-[#6a92c2] text-white rounded-lg"
                        onClick={handleSubmit}>
                      
                            Build Careplans
                             </button>
                            {message && <p className="mt-4 text-red-600">{message}</p>}
                       
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}