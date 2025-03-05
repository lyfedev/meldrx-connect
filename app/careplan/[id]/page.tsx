"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/PatientPage.css";

import { useRouter } from 'next/navigation';




const CareplanPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const pdfUrl = `https://meldrxcareplans.s3.us-east-1.amazonaws.com/${id}_careplan.pdf`;
    console.log(pdfUrl)

    // State to track if the PDF is available
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        const checkFile = async () => {
            try {
                // Use HEAD request to check if the file exists
                const response = await fetch(pdfUrl, { method: "HEAD" });

                if (response.ok) {
                    setIsAvailable(true); // File exists
                } else {
                    setIsAvailable(false); // File does not exist or is restricted
                }
            } catch (error) {
                setIsAvailable(false); // Network error or S3 restriction
            }
        };

        checkFile();
    }, [pdfUrl]);



    return (
    <div style={containerStyle}>
        <Header />
        <div style={pdfContainerStyle}>
            {isAvailable === null ? (
                <p>Loading...</p> // Show while checking
            ) : isAvailable ? (
                <iframe src={pdfUrl} width="80%" height="600px" />
            ) : (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <p style={noCareplanStyle}>No Careplan Available for this Patient</p>
                    <button 
                        onClick={() => router.push("/patientselect")} 
                        style={{
                            marginTop: "10px",
                            padding: "10px 20px",
                            backgroundColor: "#6a92c2",
                            color: "white",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Create Careplan
                    </button>
                </div>
            )}
        </div>
        <Footer />
    </div>
);



};





const containerStyle: React.CSSProperties = {
    backgroundColor: "#ecf3f5",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
};

const pdfContainerStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "20px 0",
};

const noCareplanStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#555",
};

export default CareplanPage;