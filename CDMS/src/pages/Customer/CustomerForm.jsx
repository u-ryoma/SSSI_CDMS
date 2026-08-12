import React from "react";

const CustomerForm = ({
  formData,
  onSubmit,
  submitLabel,
  isModal,
  onDelete,
  onChangeField,
  onContactChange,
  onAddContact,
  onRemoveContact,
}) => (
  <form onSubmit={onSubmit}>
    <div className="form-group">
      <label>Company Name</label>
      <input
        type="text"
        name="companyName"
        value={formData.companyName}
        onChange={onChangeField}
        required
      />
    </div>

    <div className="form-group">
      <label>Company Address</label>
      <textarea
        name="companyAddress"
        value={formData.companyAddress}
        onChange={onChangeField}
        required
      />
    </div>

    <div className="form-group">
      <label>Contact Name(s)</label>
      <div className="contact-wrapper">
        {formData.contactNames.map((contact, index) => (
          <div key={index} className="contact-row">
            <input
              type="text"
              placeholder={`Contact Name ${index + 1}`}
              value={contact}
              onChange={(e) => onContactChange(index, e.target.value)}
              className="contact-input"
            />
            {formData.contactNames.length > 1 && (
              <button
                type="button"
                className="remove-contact-btn"
                onClick={() => onRemoveContact(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="add-contact-btn"
          onClick={onAddContact}
        >
          + Add Contact
        </button>
      </div>
    </div>

    <div className="form-group">
      <label>Phone Number</label>
      <input
        type="text"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={onChangeField}
      />
    </div>

    <div className="form-group">
      <label>Fax Number</label>
      <input
        type="text"
        name="faxNumber"
        value={formData.faxNumber}
        onChange={onChangeField}
      />
    </div>

    <div className="form-group">
      <label>Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={onChangeField}
      />
    </div>

    <div className="form-group">
      <label>VAT</label>
      <input
        type="text"
        name="vat"
        value={formData.vat}
        onChange={onChangeField}
      />
    </div>

    <div className="form-group">
      <label>Remarks</label>
      <textarea
        name="remarks"
        value={formData.remarks}
        onChange={onChangeField}
      />
    </div>

    <div className="button-wrapper">
      <button type="submit" className="save-btn">
        {submitLabel}
      </button>
      {isModal && (
        <button type="button" className="delete-btn" onClick={onDelete}>
          Delete Customer
        </button>
      )}
    </div>
  </form>
);

export default CustomerForm;
