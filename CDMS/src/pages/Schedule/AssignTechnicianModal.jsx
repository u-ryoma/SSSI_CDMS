import { useState } from "react";
import "./AssignTechnicianModal.css";

export default function AssignTechnicianModal({
  date,
  technicians,
  existingAssignments,
  onAssign,
  onRemove,
  onClose,
}) {
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formattedDate = date.toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const assignedIds = existingAssignments.map((a) => a.technician?._id);
  const availableTechnicians = technicians.filter(
    (t) => !assignedIds.includes(t._id),
  );

  const handleAssign = async () => {
    if (!selectedTechnician) {
      setError("Please select a technician.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter the site location.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onAssign(selectedTechnician, notes, location.trim());
      setSelectedTechnician("");
      setLocation("");
      setNotes("");
    } catch (err) {
      setError(err.message || "Failed to assign technician.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="atm-overlay" onClick={onClose}>
      <div className="atm-content" onClick={(e) => e.stopPropagation()}>
        <div className="atm-header">
          <h2>{formattedDate}</h2>
          <button className="atm-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="atm-body">
          <h3>On-Site Technicians</h3>
          {existingAssignments.length === 0 ? (
            <p className="atm-empty">No technicians assigned yet.</p>
          ) : (
            <ul className="atm-assigned-list">
              {existingAssignments.map((a) => (
                <li key={a._id}>
                  <div className="atm-assigned-main">
                    <span className="atm-tech-name">
                      {a.technician?.name || "Unknown"}
                    </span>
                    <button
                      className="atm-remove-btn"
                      onClick={() => onRemove(a._id)}
                      title="Remove assignment"
                    >
                      Remove
                    </button>
                  </div>
                  {a.location && (
                    <span className="atm-location">📍 {a.location}</span>
                  )}
                  {a.notes && <span className="atm-notes">{a.notes}</span>}
                </li>
              ))}
            </ul>
          )}

          <div className="atm-divider" />

          <h3>Assign Technician</h3>
          {availableTechnicians.length === 0 ? (
            <p className="atm-empty">All technicians are already assigned.</p>
          ) : (
            <>
              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="atm-select"
              >
                <option value="">-- Select technician --</option>
                {availableTechnicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <label className="atm-field-label" htmlFor="atm-location">
                Site location
              </label>
              <input
                id="atm-location"
                type="text"
                placeholder="e.g. Bldg 4 Rooftop Unit, or client site address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="atm-input"
              />

              <textarea
                placeholder="Notes (optional) — e.g. job number, access instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="atm-textarea"
                rows={2}
              />

              {error && <p className="atm-error">{error}</p>}

              <button
                className="atm-assign-btn"
                onClick={handleAssign}
                disabled={submitting}
              >
                {submitting ? "Assigning..." : "Assign"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
