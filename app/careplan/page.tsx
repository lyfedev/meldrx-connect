"use client";
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PatientPage.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CareplanRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.push("/careplan/nopatientid"); // Redirect immediately
    }, [router]);

    return null; // No UI needed, just redirect
};



const containerStyle = {
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

export default CareplanRedirect;