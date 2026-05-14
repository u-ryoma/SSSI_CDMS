// export default function JobList() {
//   return (
//     <div>
//       <h1>Job Number List</h1>
//       <p>Job list page coming soon.</p>
//     </div>
//   );
// }
// jobnumber.jsx

import React, { useState } from "react";
import "./jobnumber.css";

const JobNumber = () => {
  const [activeTab, setActiveTab] = useState("list");

  const [jobs, setJobs] = useState([
    {
      jobNumber: "JOB-001",
      dateRec: "2026-05-08",
      mor: "MOR-1001",
      companyName: "ABC Company",
      jobStatus: "Pending",
      description: "Calibration",
      brand: "Fluke",
      model: "F101",
      serialNo: "SN001",
      eta: "2026-05-15",
      remarks: "Waiting",
    },
  ]);

  const [formData, setFormData] = useState({
    jobNumber: "",
    dateRec: "",
    mor: "",
    companyName: "",
    jobStatus: "",
    description: "",
    brand: "",
    model: "",
    serialNo: "",
    eta: "",
    remarks: "",
  });

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SAVE JOB
  const handleSubmit = (e) => {
    e.preventDefault();

    setJobs([...jobs, formData]);

    setFormData({
      jobNumber: "",
      dateRec: "",
      mor: "",
      companyName: "",
      jobStatus: "",
      description: "",
      brand: "",
      model: "",
      serialNo: "",
      eta: "",
      remarks: "",
    });

    alert("Job Added Successfully!");
  };

  return (
    <div className="job-container">
      {/* HEADER */}
      <div className="job-header">
        <div>
          {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM</h1> */}
          <h2>LIST OF JOB NUMBERS</h2>
        </div>
      </div>

      {/* TABS */}
      <div className="job-tabs">
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          List of Jobs
        </button>

        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add Job
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="search-bar">
        <select>
          <option>Company Name</option>
          <option>Job Number</option>
          <option>Brand</option>
        </select>

        <input type="text" placeholder="Search..." />

        <button>Search</button>

        <select>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>

        <button>Quick Log</button>
      </div>

      {/* LIST TAB */}
      {activeTab === "list" && (
        <div className="table-wrapper">
          <table className="job-table">
            <thead>
              <tr>
                <th>Job Number</th>
                <th>Date Rec</th>
                <th>MOR</th>
                <th>Company Name</th>
                <th>Job Status</th>
                <th>Description</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Serial No</th>
                <th>ETA</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job, index) => (
                <tr key={index}>
                  <td>{job.jobNumber}</td>
                  <td>{job.dateRec}</td>
                  <td>{job.mor}</td>
                  <td>{job.companyName}</td>
                  <td>{job.jobStatus}</td>
                  <td>{job.description}</td>
                  <td>{job.brand}</td>
                  <td>{job.model}</td>
                  <td>{job.serialNo}</td>
                  <td>{job.eta}</td>
                  <td>{job.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD JOB TAB */}
      {activeTab === "add" && (
        <div className="job-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Number</label>
              <input
                type="text"
                name="jobNumber"
                value={formData.jobNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date Received</label>
              <input
                type="date"
                name="dateRec"
                value={formData.dateRec}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>MOR</label>
              <input
                type="text"
                name="mor"
                value={formData.mor}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Job Status</label>
              <input
                type="text"
                name="jobStatus"
                value={formData.jobStatus}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Serial No</label>
              <input
                type="text"
                name="serialNo"
                value={formData.serialNo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>ETA</label>
              <input
                type="date"
                name="eta"
                value={formData.eta}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="button-wrapper">
              <button type="submit" className="save-btn">
                Save Job
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default JobNumber;
