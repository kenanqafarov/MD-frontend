import React from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import '../../assets/style/layout.css'; // Import your CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  faUser, 
  faStethoscope, 
  faClipboardList, 
  faNotesMedical,
  faHistory,
  faShieldAlt,
  faPrescriptionBottleMedical,
  faXRay,
  faImage,
  faVideo,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

import { useParams } from "react-router-dom"; // Import useParams

const PatientLayout = () => {
  const location = useLocation();
  const { id } = useParams(); // Get the patient ID from the URL

  const isActive = (paths) => {
    const currentPath = location.pathname;
    if (Array.isArray(paths)) {
      return paths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
    }
    return currentPath === paths || currentPath.startsWith(paths + '/');
  };

  return (
    <div className="patient-layout">
      <header className="patient-header">
        <nav className="patient-nav">
          <Link 
            to={`/patients/patient/${id}/general`}
            className={isActive(`/patients/patient/${id}/general`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faUser} /> Ümumi
          </Link>
          <Link 
            to={`/patients/patient/${id}/examination`}
            className={isActive(`/patients/patient/${id}/examination`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faStethoscope} /> Müayinə
          </Link>
          <Link 
            to={`/patients/patient/${id}/plans`}
            className={isActive([`/patients/patient/${id}/plans`, `/patients/patient/${id}/plan/edit`, `/patients/patient/${id}/plan/create`, `/patients/patient/${id}/compare-plans`]) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faClipboardList} /> Planlar
          </Link>
          <Link 
            to={`/patients/patient/${id}/treatment`}
            className={isActive(`/patients/patient/${id}/treatment`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faNotesMedical} /> Müalicə
          </Link>
          <Link 
            to={`/patients/patient/${id}/history`}
            className={isActive(`/patients/patient/${id}/history`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faHistory} /> Anamnez
          </Link>
          <Link 
            to={`/patients/patient/${id}/insurance`}
            className={isActive(`/patients/patient/${id}/insurance`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faShieldAlt} /> Sığorta
          </Link>
          <Link 
            to={`/patients/patient/${id}/prescription`}
            className={isActive(`/patients/patient/${id}/prescription`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faPrescriptionBottleMedical} /> Resept
          </Link>
          <Link 
            to={`/patients/patient/${id}/xray`}
            className={isActive(`/patients/patient/${id}/xray`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faXRay} /> Rentgen
          </Link>
          <Link 
            to={`/patients/patient/${id}/images`}
            className={isActive(`/patients/patient/${id}/images`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faImage} /> Şəkil
          </Link>
          <Link 
            to={`/patients/patient/${id}/video`}
            className={isActive(`/patients/patient/${id}/video`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faVideo} /> Video
          </Link>
          <Link 
            to={`/patients/patient/${id}/report`}
            className={isActive(`/patients/patient/${id}/report`) ? 'active' : ''}
          >
            <FontAwesomeIcon icon={faFileAlt} /> Hesabat
          </Link>
        </nav>
      </header>
      <main className="patient-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PatientLayout;