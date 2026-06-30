import React, { useState, useEffect } from 'react';
import { HiArrowsUpDown } from "react-icons/hi2";

// Style
import "../../assets/style/ReportsPage/reports.css";

// Icons
import { FiDownload } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";

// Libraries
import { Link } from 'react-router-dom';

// Components
import CustomDropdown from '../../components/CustomDropdown';

// Store
import useGeneralCalendarStore from '../../../stores/appointments';
import usePriceCategoryStore from '../../../stores/priceCategoryStore';
import useOperationTypesStore from '../../../stores/operationsTypeStore'; // New import

function ReportsPage() {
 const { doctors, fetchDoctors } = useGeneralCalendarStore();
 const { categories, fetchCategories } = usePriceCategoryStore();
 const { operationTypes, fetchAll } = useOperationTypesStore(); // New

 const dates = [
  { value: "2024-01-01", label: "01.01.2024" },
  { value: "2024-02-01", label: "01.02.2024" },
  { value: "2024-03-01", label: "01.03.2024" }
 ];

 // States for dropdown selections
 const [plannerDoctor, setPlannerDoctor] = useState(null);
 const [executorDoctor, setExecutorDoctor] = useState(null);
 const [category, setCategory] = useState(null);
 const [operation, setOperation] = useState(null);
 const [startDate, setStartDate] = useState(null);
 const [endDate, setEndDate] = useState(null);

 // Fetch all necessary data on component mount
 useEffect(() => {
  fetchDoctors();
  fetchCategories();
  fetchAll(); // Fetch operation types
 }, [fetchDoctors, fetchCategories, fetchAll]);

 // Format fetched data for dropdowns
 const formattedDoctors = doctors.map(doctor => ({
  value: doctor.doctorId,
  label: doctor.name + " " + doctor.surname
 }));

 const formattedCategories = categories.map(cat => ({
  value: cat.id,
  label: cat.name
 }));

 const formattedOperations = operationTypes.map(op => ({ // New
  value: op.id,
  label: op.categoryName
 }));
 

 const handleSearch = () => {
  console.log("Planlayan:", plannerDoctor);
  console.log("İcraçı:", executorDoctor);
  console.log("Kateqoriya:", category);
  console.log("Əməliyyat:", operation);
  console.log("Tarix Baş:", startDate);
  console.log("Tarix Bit:", endDate);
 };

 const reportData = [
  {
   planDate: "01.05.2024",
   patient: "Elnur Quliyev",
   toothNo: "12",
   operation: "Implant",
   plannerDoctor: "Dr. Murad",
   price: "300 AZN",
   discount: "50 AZN",
   total: "250 AZN",
   executionDate: "05.05.2024",
   executorDoctor: "Dr. Aysel"
  },
  {
   planDate: "02.05.2024",
   patient: "Aysel Məmmədova",
   toothNo: "24",
   operation: "Diş Çəkimi",
   plannerDoctor: "Dr. Cavid",
   price: "80 AZN",
   discount: "0 AZN",
   total: "80 AZN",
   executionDate: "04.05.2024",
   executorDoctor: "Dr. Murad"
  },
 ];

 return (
  <div className="reportsPageWrapper p-3">
   <div className="reportsPageTopPart">
    <p className='reportsPageTitle'>Hesabat</p>
    <Link className='reportsDownload' to={"/"}>
     <FiDownload className='reportsDownloadIcon' />
    </Link>
   </div>
   <div className="reportsPageQuickSearch">
    <div className="quickSearchLeftPart -ml-5">
     <CustomDropdown
      value={plannerDoctor}
      onChange={(option) => setPlannerDoctor(option.value)}
      options={formattedDoctors}
      placeholder="Planlayan həkim"
     />
     <CustomDropdown
      value={executorDoctor}
      onChange={(option) => setExecutorDoctor(option.value)}
      options={formattedDoctors}
      placeholder="İcraçı həkim"
     />
     <CustomDropdown
      value={category}
      onChange={(option) => setCategory(option.value)}
      options={formattedCategories}
      placeholder="Kateqoriya"
     />
     <CustomDropdown
      value={operation}
      onChange={(option) => setOperation(option.value)}
      options={formattedOperations} // Updated
      placeholder="Əməliyyat"
     />
<input
  value={startDate}
  type={startDate ? 'date' : 'text'}
  onFocus={(e) => (e.target.type = 'date')}
  onChange={(e) => setStartDate(e.target.value)}
  placeholder="Tarix baş."
  className='border-1 border-[#D4DCE8] rounded-md p-2'
/>

<input
  value={endDate}
  type={endDate ? 'date' : 'text'}
  onFocus={(e) => (e.target.type = 'date')}
  onChange={(e) => setEndDate(e.target.value)}
  placeholder="Tarix bit."
  className='border-1 border-[#D4DCE8] rounded-md p-2'
/>
    </div>
    <div className="quickSearchRightPart">
     <IoIosSearch
      className='quickSearchReportIcon'
      onClick={handleSearch}
     />
    </div>
   </div>
   <div className="reportsTableWrapper">
    <div className="tableScrollContainer">
     <table className="reportsTable">
      <thead>
       <tr>
        <th>1-{reportData.length}</th>
        <th>
           <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" /> Plan tarixi
              </span>
            </div>
         </th>
        <th>
          <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text- ml-6" />  Pasiyent
              </span>
          </div>
         </th>
        <th>
           <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" />  Diş No
              </span>
          </div>
        </th>
        <th>
           <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" />   Əməliyyat
              </span>
          </div>
         </th>
        <th>
           <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" />  Planlayan həkim
              </span>
          </div>
        </th>
        <th>
           <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" />   Qiyməti
              </span>
          </div>
         </th>
        <th>
            <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" />    Endirim
              </span>
          </div>
        </th>
        <th>
            <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" />   Yekun  
              </span>
           </div>
        </th>
        <th>
            <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" />  İcra tarixi  
              </span>
           </div>
        </th>
        <th>
           <div className="th-content">
              <span className="!flex !items-center gap-1">
                  <HiArrowsUpDown className="tableArrowIcon !text-sm" />  İcraçı həkim      
              </span>
           </div>
            </th>
       </tr>
      </thead>
      <tbody>
       {reportData.map((item, index) => (
        <tr key={index}>
         <td>{index + 1}</td>
         <td>{item.planDate}</td>
         <td>{item.patient}</td>
         <td>{item.toothNo}</td>
         <td>{item.operation}</td>
         <td>{item.plannerDoctor}</td>
         <td>{item.price}</td>
         <td>{item.discount}</td>
         <td>{item.total}</td>
         <td>{item.executionDate}</td>
         <td>{item.executorDoctor}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>
   <div className="reportsTableResultMoney">
    <p className='resultForReports'>Cəmi:</p>
    <p className='reportsForResult'>345.6</p>
    <p className='reportsForDicounted'>325.6</p>
   </div>
  </div>
 );
}

export default ReportsPage;