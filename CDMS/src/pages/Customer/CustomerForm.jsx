// import React from "react";

// // Small reusable label that renders a red asterisk when a field is required.
// const Label = ({ children, required }) => (
//   <label>
//     {children}
//     {required && <span className="required-mark"> *</span>}
//   </label>
// );

// const CustomerForm = ({
//   formData,
//   onSubmit,
//   submitLabel,
//   isModal,
//   onDelete,
//   onChangeField,
//   onContactChange,
//   onAddContact,
//   onRemoveContact,
// }) => (
//   <form onSubmit={onSubmit} className="customer-form" noValidate>
//     <div className="form-columns">
//       <div className="form-column">
//         <div className="form-group">
//           <Label required>Company Name</Label>
//           <input
//             type="text"
//             name="companyName"
//             placeholder="e.g. Acme Laboratories Inc."
//             value={formData.companyName}
//             onChange={onChangeField}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <Label required>Company Address</Label>
//           <textarea
//             name="companyAddress"
//             placeholder="Street, City, Province, ZIP"
//             value={formData.companyAddress}
//             onChange={onChangeField}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <Label required>Contact Name(s)</Label>
//           <div className="contact-wrapper">
//             {formData.contactNames.map((contact, index) => (
//               <div key={index} className="contact-row">
//                 <input
//                   type="text"
//                   placeholder={`Contact Name ${index + 1}`}
//                   value={contact}
//                   onChange={(e) => onContactChange(index, e.target.value)}
//                   className="contact-input"
//                   required
//                 />
//                 {formData.contactNames.length > 1 && (
//                   <button
//                     type="button"
//                     className="remove-contact-btn"
//                     onClick={() => onRemoveContact(index)}
//                     aria-label={`Remove contact ${index + 1}`}
//                   >
//                     ✕
//                   </button>
//                 )}
//               </div>
//             ))}
//             <button
//               type="button"
//               className="add-contact-btn"
//               onClick={onAddContact}
//             >
//               + Add Contact
//             </button>
//           </div>
//         </div>

//         <div className="form-group">
//           <Label required>VAT</Label>
//           <input
//             type="text"
//             name="vat"
//             placeholder="VAT registration number"
//             value={formData.vat}
//             onChange={onChangeField}
//             required
//           />
//         </div>
//       </div>

//       <div className="form-column">
//         <div className="form-group">
//           <Label required>Phone Number</Label>
//           <input
//             type="tel"
//             inputMode="numeric"
//             name="phoneNumber"
//             placeholder="e.g. ( 0912 2431 309)"
//             value={formData.phoneNumber}
//             onChange={onChangeField}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <Label required>Fax Number</Label>
//           <input
//             type="text"
//             name="faxNumber"
//             placeholder="e.g. (02) 8123 4568"
//             value={formData.faxNumber}
//             onChange={onChangeField}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <Label required>Email</Label>
//           <input
//             type="email"
//             name="email"
//             placeholder="e.g. accounts@company.com"
//             value={formData.email}
//             onChange={onChangeField}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <Label required>Remarks</Label>
//           <textarea
//             name="remarks"
//             placeholder="Notes about this customer"
//             value={formData.remarks}
//             onChange={onChangeField}
//             required
//           />
//         </div>
//       </div>
//     </div>

//     <div className="form-footer">
//       <p className="required-note">
//         <span className="required-mark">*</span> Required fields
//       </p>
//       <div className="button-wrapper">
//         <button type="submit" className="save-btn">
//           {submitLabel}
//         </button>
//         {isModal && (
//           <button type="button" className="delete-btn" onClick={onDelete}>
//             Delete Customer
//           </button>
//         )}
//       </div>
//     </div>
//   </form>
// );

// export default CustomerForm;
import React from "react";

// Small reusable label that renders a red asterisk when a field is required.
const Label = ({ children, required }) => (
  <label>
    {children}
    {required && <span className="required-mark"> *</span>}
  </label>
);

const PHONE_LENGTH = 11;
const FAX_LENGTH = 10;

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
}) => {
  // Strips non-digits, trims to maxLength, then passes a minimal event-like
  // object to the parent's onChangeField (which only reads name and value).
  const handleNumericChange = (maxLength) => (e) => {
    const { name, value } = e.target;
    const digits = value.replace(/\D/g, "").slice(0, maxLength);
    onChangeField({ target: { name, value: digits } });
  };

  return (
    <form onSubmit={onSubmit} className="customer-form" noValidate>
      <div className="form-columns">
        <div className="form-column">
          <div className="form-group">
            <Label required>Company Name</Label>
            <input
              type="text"
              name="companyName"
              placeholder="e.g. Acme Laboratories Inc."
              value={formData.companyName}
              onChange={onChangeField}
              required
            />
          </div>

          <div className="form-group">
            <Label required>Company Address</Label>
            <textarea
              name="companyAddress"
              placeholder="Street, City, Province, ZIP"
              value={formData.companyAddress}
              onChange={onChangeField}
              required
            />
          </div>

          <div className="form-group">
            <Label required>Contact Name(s)</Label>
            <div className="contact-wrapper">
              {formData.contactNames.map((contact, index) => (
                <div key={index} className="contact-row">
                  <input
                    type="text"
                    placeholder={`Contact Name ${index + 1}`}
                    value={contact}
                    onChange={(e) => onContactChange(index, e.target.value)}
                    className="contact-input"
                    required
                  />
                  {formData.contactNames.length > 1 && (
                    <button
                      type="button"
                      className="remove-contact-btn"
                      onClick={() => onRemoveContact(index)}
                      aria-label={`Remove contact ${index + 1}`}
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
            <Label required>VAT</Label>
            <input
              type="text"
              name="vat"
              placeholder="VAT registration number"
              value={formData.vat}
              onChange={onChangeField}
              required
            />
          </div>
        </div>

        <div className="form-column">
          <div className="form-group">
            <Label required>Phone Number</Label>
            <input
              type="tel"
              inputMode="numeric"
              name="phoneNumber"
              placeholder="e.g. 09122431309"
              value={formData.phoneNumber}
              onChange={handleNumericChange(PHONE_LENGTH)}
              maxLength={PHONE_LENGTH}
              required
            />
          </div>

          <div className="form-group">
            <Label required>Fax Number</Label>
            <input
              type="text"
              inputMode="numeric"
              name="faxNumber"
              placeholder="e.g. 0281234567"
              value={formData.faxNumber}
              onChange={handleNumericChange(FAX_LENGTH)}
              maxLength={FAX_LENGTH}
              required
            />
          </div>

          <div className="form-group">
            <Label required>Email</Label>
            <input
              type="email"
              name="email"
              placeholder="e.g. accounts@company.com"
              value={formData.email}
              onChange={onChangeField}
              required
            />
          </div>

          <div className="form-group">
            <Label required>Remarks</Label>
            <textarea
              name="remarks"
              placeholder="Notes about this customer"
              value={formData.remarks}
              onChange={onChangeField}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-footer">
        <p className="required-note">
          <span className="required-mark">*</span> Required fields
        </p>
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
      </div>
    </form>
  );
};

export default CustomerForm;
