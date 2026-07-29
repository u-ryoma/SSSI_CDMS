import React, { useState, useEffect, useCallback } from "react";
import "../QuotationList.css";
import QuotationDetailsModal from "../QuotationForChecking/QuotationDetailsModal"; // adjust path to match your actual folder structure

const API = import.meta.env.VITE_API_URL;

/**
 * QtnForSend — "Quotation For Send" list.
 *
 * Shows quotations with status "For Sending" — records where the
 * checker has already uploaded the signed file via PUT
 * .../upload-signed (which also sets checkedBy and requires
 * x-user-role admin|clerk).
 *
 * Opening a row's QuotationDetailsModal with stage="send" means:
 *  - the file shown/downloaded is signedFileUrl
 *  - there's no file-based re-upload/advance at this stage
 *  - the primary action is "Mark as Sent" (PUT .../mark-sent), which
 *    sets status -> "Sent" and records sentBy/sentAt
 *  - once marked sent, onSaved below drops the row from this list
 */
const SEARCH_FIELDS = ["Company Name", "Contact Name", "JR ID"];
const FIELD_MAP = {
  "Company Name": "companyName",
  "Contact Name": "contactName",
  "JR ID": "reference",
};

const QtnForSend = () => {
  const [searchField, setSearchField] = useState(SEARCH_FIELDS[0]);
  const [search, setSearch] = useState("");
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/quotations`);
      if (!res.ok) throw new Error("Failed to load quotations");
      const all = await res.json();
      setQuotations(
        (Array.isArray(all) ? all : []).filter(
          (q) => q.status === "For Sending",
        ),
      );
    } catch (err) {
      console.error("Failed to fetch quotations:", err);
      setError("Failed to load quotations. Please try again.");
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const filteredQuotations = quotations.filter((q) => {
    if (!search.trim()) return true;
    const field = FIELD_MAP[searchField];
    const value = q[field] || "";
    return value.toLowerCase().includes(search.toLowerCase());
  });

  const handleRowClick = (q) => setSelectedQuotation(q);
  const handleModalClose = () => setSelectedQuotation(null);

  const handleQuotationSaved = (updated) => {
    setQuotations((prev) => {
      // Status moved on (e.g. -> "Sent") -> no longer belongs here.
      if (updated.status && updated.status !== "For Sending") {
        return prev.filter((q) => q.quotationId !== updated.quotationId);
      }
      return prev.map((q) =>
        q.quotationId === updated.quotationId ? { ...q, ...updated } : q,
      );
    });
  };

  return (
    <div className="quotation-container">
      <div className="quotation-header">
        <h2>QUOTATION FOR SEND</h2>
      </div>

      <div className="quotation-tabs">
        <button className="active">List of Quotations</button>
      </div>

      <div className="quotation-search">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          {SEARCH_FIELDS.map((field, idx) => (
            <option key={idx} value={field}>
              {field}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={fetchQuotations} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <div className="quotation-error">{error}</div>}

      <div className="quotation-table-wrapper">
        <table className="quotation-table">
          <thead>
            <tr>
              <th>Quotation ID</th>
              <th>Date</th>
              <th>Company Name</th>
              <th>Company Address</th>
              <th>Contact Info</th>
              <th>Contact Name</th>
              <th>Ref No.</th>
              <th>Prepared By</th>
              <th>Checked By</th>
              <th>Sent By</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredQuotations.length === 0 && (
              <tr>
                <td colSpan={10} className="quotation-empty">
                  No quotations currently for sending.
                </td>
              </tr>
            )}
            {filteredQuotations.map((q) => (
              <tr
                key={q.quotationId}
                className="quotation-row-clickable"
                onClick={() => handleRowClick(q)}
              >
                <td>{q.quotationId}</td>
                <td>{q.date}</td>
                <td>{q.companyName}</td>
                <td>{q.address}</td>
                <td>{q.contactInfo}</td>
                <td>{q.contactName}</td>
                <td>{q.reference}</td>
                <td>{q.preparedBy}</td>
                <td>{q.checkedBy}</td>
                <td>{q.sentBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={handleModalClose}
          onSaved={handleQuotationSaved}
          stage="send"
        />
      )}
    </div>
  );
};

export default QtnForSend;
