// import React, { useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useProject } from "../Context/projectContext";
// import { PopupAlert } from "../Components/alert";
// import { updateFormResponseData } from "../Api/updateFormResponse";
// import { addConsentRemoveRequest } from "../Api/addRemoveConsentRequest";
// import { sendOtpMail } from "../Api/sendMailOtp";

// /* ================= TYPES ================= */
// type FieldType =
//     | "text"
//     | "email"
//     | "phone"
//     | "number"
//     | "dropdown"
//     | "radio"
//     | "checkbox"
//     | "date"
//     | "upload"
//     | "terms";

// type BuilderField = {
//     id: string;
//     type: FieldType;
//     label: string;
//     placeholder?: string;
//     required: boolean;
//     validation?: {
//         minLength?: number;
//         maxLength?: number;
//         errorMessage?: string;
//         pattern?: string;
//     };
//     description?: string;
//     descriptionAuto?: boolean;
//     options?: { id: string; label: string; value?: string }[];
//     numberConfig?: { min?: number; max?: number };
//     uploadConfig?: { accept?: string; multiple?: boolean; maxSizeMB?: number };
//     termsConfig?: { text?: string };
//     locked?: boolean;
//     value?: any;
// };

// type Meta = {
//     title?: string;
//     subtitle?: string;
//     category?: string;
// };

// type FormResponseSchema = {
//     id?: string;
//     meta?: Meta;
//     fields?: BuilderField[];
//     createdAt?: string;
//     updatedAt?: string;
//     submittedAt?: string;
// };

// /* ================= VALIDATION HELPERS ================= */
// const isPasswordField = (f: BuilderField) => {
//     const text = `${f.id} ${f.label} ${f.placeholder ?? ""}`.toLowerCase();
//     return text.includes("password") || text.includes("pass word") || text.includes("pwd");
// };

// const isPhoneField = (f: BuilderField) => {
//     const text = `${f.id} ${f.label} ${f.placeholder ?? ""}`.toLowerCase();

//     if (
//         text.includes("pincode") ||
//         text.includes("pin code") ||
//         text.includes("postal code") ||
//         text.includes("zipcode") ||
//         text.includes("zip code")
//     ) {
//         return false;
//     }

//     return (
//         f.type === "phone" ||
//         text.includes("mobile") ||
//         text.includes("phone") ||
//         text.includes("contact")
//     );
// };

// const isEmailField = (f: BuilderField) => {
//     const text = `${f.id} ${f.label} ${f.placeholder ?? ""}`.toLowerCase();
//     return f.type === "email" || text.includes("email") || text.includes("e-mail");
// };

// const isPincodeField = (f: BuilderField) => {
//     const text = `${f.id} ${f.label} ${f.placeholder ?? ""}`.toLowerCase();
//     return (
//         text.includes("pincode") ||
//         text.includes("pin code") ||
//         text.includes("postal code") ||
//         text.includes("zipcode") ||
//         text.includes("zip code")
//     );
// };

// const getEmptyErrorMessage = (f: BuilderField) =>
//     f.validation?.errorMessage?.trim() || "This field is required.";

// const validateField = (f: BuilderField, value: any): string => {
//     const isEmpty =
//         value === null ||
//         value === undefined ||
//         (typeof value === "string" && value.trim() === "") ||
//         (Array.isArray(value) && value.length === 0) ||
//         (typeof value === "boolean" && value === false && f.type === "terms");

//     if (f.required && isEmpty) {
//         return getEmptyErrorMessage(f);
//     }

//     if (isEmpty) return "";

//     const strValue = typeof value === "string" ? value.trim() : value;

//     if (isEmailField(f) && typeof strValue === "string" && strValue !== "") {
//         const regex = f.validation?.pattern
//             ? new RegExp(f.validation.pattern)
//             : /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         if (!regex.test(strValue)) {
//             return f.validation?.errorMessage?.trim() || "Please enter a valid email address.";
//         }
//     }

//     if (isPincodeField(f) && typeof strValue === "string" && strValue !== "") {
//         const onlyDigits = strValue.replace(/\D/g, "");
//         if (!/^\d{6}$/.test(onlyDigits)) {
//             return f.validation?.errorMessage?.trim() || "Please enter a valid 6-digit pincode.";
//         }
//         return "";
//     }

//     if (isPhoneField(f) && typeof strValue === "string" && strValue !== "") {
//         const onlyDigits = strValue.replace(/\D/g, "");
//         if (!/^\d{10}$/.test(onlyDigits)) {
//             return (
//                 f.validation?.errorMessage?.trim() ||
//                 "Please enter a valid 10-digit mobile number."
//             );
//         }
//         return "";
//     }

//     if (isPasswordField(f) && typeof strValue === "string" && strValue !== "") {
//         const passwordRegex =
//             /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+={}[\]:;"'<>,./\\|`~]).{8,}$/;

//         if (!passwordRegex.test(strValue)) {
//             return (
//                 f.validation?.errorMessage?.trim() ||
//                 "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
//             );
//         }
//         return "";
//     }

//     if (f.type === "number" && strValue !== "") {
//         const n = Number(strValue);

//         if (Number.isNaN(n)) {
//             return f.validation?.errorMessage?.trim() || "Please enter a valid number.";
//         }

//         if (typeof f.numberConfig?.min === "number" && n < f.numberConfig.min) {
//             return (
//                 f.validation?.errorMessage?.trim() ||
//                 `Value must be at least ${f.numberConfig.min}.`
//             );
//         }

//         if (typeof f.numberConfig?.max === "number" && n > f.numberConfig.max) {
//             return (
//                 f.validation?.errorMessage?.trim() ||
//                 `Value must be at most ${f.numberConfig.max}.`
//             );
//         }

//         return "";
//     }

//     if (typeof strValue === "string") {
//         const plainLength = strValue.length;

//         if (
//             typeof f.validation?.minLength === "number" &&
//             plainLength < f.validation.minLength
//         ) {
//             return (
//                 f.validation?.errorMessage?.trim() ||
//                 `Minimum ${f.validation.minLength} characters required.`
//             );
//         }

//         if (
//             typeof f.validation?.maxLength === "number" &&
//             plainLength > f.validation.maxLength
//         ) {
//             return (
//                 f.validation?.errorMessage?.trim() ||
//                 `Maximum ${f.validation.maxLength} characters allowed.`
//             );
//         }
//     }

//     return "";
// };

// /* ================= FIELD RENDER ================= */
// const renderField = (
//     f: BuilderField,
//     value: any,
//     setValue: (v: any) => void,
//     onBlur?: () => void,
//     error?: string
// ) => {
//     const controlClass = `form-control ${error ? "is-invalid" : ""}`;
//     const selectClass = `form-select ${error ? "is-invalid" : ""}`;

//     switch (f.type) {
//         case "dropdown":
//             return (
//                 <select
//                     className={selectClass}
//                     required={f.required}
//                     value={value ?? ""}
//                     onChange={(e) => setValue(e.target.value)}
//                     onBlur={onBlur}
//                 >
//                     <option value="">{f.placeholder || "Select..."}</option>
//                     {(f.options ?? []).map((o) => (
//                         <option key={o.id} value={o.value ?? o.label}>
//                             {o.label}
//                         </option>
//                     ))}
//                 </select>
//             );

//         case "radio":
//             return (
//                 <div className="mt-2">
//                     {(f.options ?? []).map((o) => {
//                         const v = o.value ?? o.label;
//                         return (
//                             <div key={o.id} className="form-check mb-2">
//                                 <input
//                                     className={`form-check-input ${error ? "is-invalid" : ""}`}
//                                     type="radio"
//                                     name={f.id}
//                                     value={v}
//                                     checked={value === v}
//                                     required={f.required}
//                                     onChange={(e) => setValue(e.target.value)}
//                                     onBlur={onBlur}
//                                 />
//                                 <label className="form-check-label">{o.label}</label>
//                             </div>
//                         );
//                     })}
//                 </div>
//             );

//         case "checkbox":
//             return (
//                 <div className="mt-2">
//                     {(f.options ?? []).map((o) => {
//                         const v = o.value ?? o.label;
//                         const arr: string[] = Array.isArray(value) ? value : [];
//                         const checked = arr.includes(v);

//                         return (
//                             <div key={o.id} className="form-check mb-2">
//                                 <input
//                                     className={`form-check-input ${error ? "is-invalid" : ""}`}
//                                     type="checkbox"
//                                     checked={checked}
//                                     onChange={(e) => {
//                                         if (e.target.checked) setValue([...arr, v]);
//                                         else setValue(arr.filter((x) => x !== v));
//                                     }}
//                                     onBlur={onBlur}
//                                 />
//                                 <label className="form-check-label">{o.label}</label>
//                             </div>
//                         );
//                     })}
//                 </div>
//             );

//         case "number":
//             return (
//                 <input
//                     className={controlClass}
//                     type="number"
//                     placeholder={f.placeholder || ""}
//                     min={f.numberConfig?.min}
//                     max={f.numberConfig?.max}
//                     required={f.required}
//                     value={value ?? ""}
//                     onChange={(e) => setValue(e.target.value)}
//                     onBlur={onBlur}
//                 />
//             );

//         case "email":
//             return (
//                 <input
//                     className={controlClass}
//                     type="email"
//                     placeholder={f.placeholder || ""}
//                     required={f.required}
//                     minLength={f.validation?.minLength}
//                     maxLength={f.validation?.maxLength}
//                     value={value ?? ""}
//                     onChange={(e) => setValue(e.target.value)}
//                     onBlur={onBlur}
//                 />
//             );

//         case "phone":
//             return (
//                 <input
//                     className={controlClass}
//                     type="text"
//                     inputMode="numeric"
//                     placeholder={f.placeholder || ""}
//                     required={f.required}
//                     minLength={f.validation?.minLength}
//                     maxLength={f.validation?.maxLength}
//                     value={value ?? ""}
//                     onChange={(e) => {
//                         const onlyDigits = e.target.value.replace(/\D/g, "");
//                         const maxLen =
//                             typeof f.validation?.maxLength === "number"
//                                 ? f.validation.maxLength
//                                 : undefined;
//                         setValue(maxLen ? onlyDigits.slice(0, maxLen) : onlyDigits);
//                     }}
//                     onBlur={onBlur}
//                 />
//             );

//         case "date":
//             return (
//                 <input
//                     className={controlClass}
//                     type="date"
//                     required={f.required}
//                     value={value ?? ""}
//                     onChange={(e) => setValue(e.target.value)}
//                     onBlur={onBlur}
//                 />
//             );

//         case "upload":
//             return (
//                 <input
//                     className={controlClass}
//                     type="file"
//                     accept={f.uploadConfig?.accept}
//                     multiple={!!f.uploadConfig?.multiple}
//                     required={f.required}
//                     onChange={(e) => {
//                         const files = (e.target as HTMLInputElement).files;
//                         if (!files) return setValue(null);
//                         if (f.uploadConfig?.multiple) setValue(Array.from(files));
//                         else setValue(files[0] ?? null);
//                     }}
//                     onBlur={onBlur}
//                 />
//             );

//         case "terms":
//             return (
//                 <label className="d-flex align-items-start gap-2">
//                     <input
//                         type="checkbox"
//                         required={f.required}
//                         checked={!!value}
//                         onChange={(e) => setValue(e.target.checked)}
//                         onBlur={onBlur}
//                     />
//                     <span>{f.termsConfig?.text ?? "I agree to the terms"}</span>
//                 </label>
//             );

//         default:
//             return (
//                 <input
//                     className={controlClass}
//                     type={isPasswordField(f) ? "password" : "text"}
//                     placeholder={f.placeholder || ""}
//                     required={f.required}
//                     minLength={f.validation?.minLength}
//                     maxLength={f.validation?.maxLength}
//                     value={value ?? ""}
//                     onChange={(e) => setValue(e.target.value)}
//                     onBlur={onBlur}
//                 />
//             );
//     }
// };

// const MyFormDetails: React.FC = () => {
//     const [searchParams] = useSearchParams();
//     const responseId = Number(searchParams.get("responseId") || searchParams.get("id"));

//     const {
//         selectedFormResponseById,
//         selectedFormResponseByIdLoading,
//         selectedFormResponseByIdError,
//         fetchFormResponseByResponseId,
//         publicIP,
//         refreshIP,
//     } = useProject();

//     const [values, setValues] = useState<Record<string, any>>({});
//     const [initialValues, setInitialValues] = useState<Record<string, any>>({});
//     const [submitted, setSubmitted] = useState(false);

//     const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
//     const [touched, setTouched] = useState<Record<string, boolean>>({});

//     const [confirmOpen, setConfirmOpen] = useState(false);
//     const [removeConsentConfirmOpen, setRemoveConsentConfirmOpen] = useState(false);

//     const [successOpen, setSuccessOpen] = useState(false);
//     const [dangerOpen, setDangerOpen] = useState(false);
//     const [dangerMsg, setDangerMsg] = useState("Something went wrong!");
//     const [successTitle, setSuccessTitle] = useState("Updated!");
//     const [successMsg, setSuccessMsg] = useState("Your response was updated successfully.");

//     const [consentTruth, setConsentTruth] = useState(false);
//     const [consentDpdp, setConsentDpdp] = useState(false);

//     const [otpServer, setOtpServer] = useState<string>("");
//     const [otpInput, setOtpInput] = useState<string>("");
//     const [otpSent, setOtpSent] = useState(false);
//     const [otpSending, setOtpSending] = useState(false);
//     const [removeConsentLoading, setRemoveConsentLoading] = useState(false);

//     // ✅ NEW
//     const [removeConsentRemark, setRemoveConsentRemark] = useState("");
//     const [removeConsentRemarkError, setRemoveConsentRemarkError] = useState("");

//     const year = useMemo(() => new Date().getFullYear(), []);

//     useEffect(() => {
//         if (!responseId || Number.isNaN(responseId)) return;
//         fetchFormResponseByResponseId(responseId);
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [responseId]);

//     useEffect(() => {
//         if (!publicIP) refreshIP();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [publicIP]);

//     const responseSchema: FormResponseSchema | null =
//         (selectedFormResponseById?.FormResponse as FormResponseSchema) ?? null;

//     const fields: BuilderField[] = responseSchema?.fields ?? [];
//     const meta: Meta = responseSchema?.meta ?? {};
//     const formId = selectedFormResponseById?.FormId ?? 0;

//     useEffect(() => {
//         if (!fields.length) return;

//         const init: Record<string, any> = {};

//         for (const f of fields) {
//             if (f.value !== undefined && f.value !== null) {
//                 init[f.id] = f.value;
//             } else if (f.type === "checkbox") {
//                 init[f.id] = [];
//             } else if (f.type === "terms") {
//                 init[f.id] = false;
//             } else {
//                 init[f.id] = "";
//             }
//         }

//         setValues(init);
//         setInitialValues(init);
//         setSubmitted(false);
//         setFieldErrors({});
//         setTouched({});
//         setConsentTruth(false);
//         setConsentDpdp(false);
//         setOtpServer("");
//         setOtpInput("");
//         setOtpSent(false);

//         // ✅ NEW
//         setRemoveConsentRemark("");
//         setRemoveConsentRemarkError("");
//     }, [selectedFormResponseById, fields.length]);

//     const validateAllFields = () => {
//         const errs: Record<string, string> = {};
//         for (const f of fields) {
//             const msg = validateField(f, values[f.id]);
//             if (msg) errs[f.id] = msg;
//         }
//         return errs;
//     };

//     const handleFieldChange = (f: BuilderField, v: any) => {
//         setValues((prev) => ({ ...prev, [f.id]: v }));

//         const msg = validateField(f, v);
//         setFieldErrors((prev) => ({
//             ...prev,
//             [f.id]: msg,
//         }));

//         setTouched((prev) => ({
//             ...prev,
//             [f.id]: true,
//         }));
//     };

//     const handleFieldBlur = (f: BuilderField) => {
//         const msg = validateField(f, values[f.id]);
//         setFieldErrors((prev) => ({
//             ...prev,
//             [f.id]: msg,
//         }));
//         setTouched((prev) => ({
//             ...prev,
//             [f.id]: true,
//         }));
//     };

//     const clearForm = () => {
//         setValues(initialValues);
//         setSubmitted(false);
//         setFieldErrors({});
//         setTouched({});
//         setConsentTruth(false);
//         setConsentDpdp(false);
//         setOtpServer("");
//         setOtpInput("");
//         setOtpSent(false);

//         // ✅ NEW
//         setRemoveConsentRemark("");
//         setRemoveConsentRemarkError("");
//     };

//     const extractEmailMobile = () => {
//         let email = "";
//         let mobile = "";

//         for (const f of fields) {
//             const v = values[f.id];

//             if (!email && (f.type === "email" || /email/i.test(f.id) || /email/i.test(f.label))) {
//                 if (typeof v === "string") email = v.trim();
//             }

//             if (
//                 !mobile &&
//                 (f.type === "phone" ||
//                     /mobile/i.test(f.id) ||
//                     /phone/i.test(f.id) ||
//                     /mobile/i.test(f.label) ||
//                     /phone/i.test(f.label))
//             ) {
//                 if (typeof v === "string") mobile = v.trim();
//             }
//         }

//         return { email, mobile };
//     };

//     const generateOtp6 = async () => {
//         const otp = String(Math.floor(100000 + Math.random() * 900000));

//         setOtpServer(otp);
//         setOtpSent(true);
//         setOtpInput("");

//         console.log("LATEST_OTP:", otp);

//         try {
//             const { email } = extractEmailMobile();

//             if (!email) {
//                 setDangerMsg("Email not found. OTP generated, but email is empty.");
//                 setDangerOpen(true);
//                 return;
//             }

//             setOtpSending(true);

//             await sendOtpMail({
//                 ToEmail: email,
//                 OTP: otp,
//                 ExpiryMinutes: 5,
//             });
//         } catch (err: any) {
//             setDangerMsg(err?.message || "OTP generated, but email sending failed");
//             setDangerOpen(true);
//         } finally {
//             setOtpSending(false);
//         }
//     };

//     const otpOk =
//         otpServer.length === 6 &&
//         otpInput.trim().length === 6 &&
//         otpInput.trim() === otpServer;

//     const canSubmit = consentTruth && consentDpdp && otpOk;
//     const canRemoveConsent = otpOk;

//     const onSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         setSubmitted(true);

//         const errs = validateAllFields();
//         setFieldErrors(errs);

//         const allTouched: Record<string, boolean> = {};
//         for (const f of fields) allTouched[f.id] = true;
//         setTouched(allTouched);

//         if (Object.keys(errs).length > 0) return;

//         setConfirmOpen(true);
//     };

//     const normalizeFieldValue = (f: BuilderField, value: any) => {
//         if (f.type === "upload") {
//             if (Array.isArray(value)) {
//                 return value.map((file: File | any) => {
//                     if (file instanceof File) {
//                         return {
//                             name: file.name,
//                             size: file.size,
//                             type: file.type,
//                         };
//                     }
//                     return file;
//                 });
//             }

//             if (value instanceof File) {
//                 return {
//                     name: value.name,
//                     size: value.size,
//                     type: value.type,
//                 };
//             }

//             return value ?? null;
//         }

//         return value;
//     };

//     const buildFormResponsePayload = () => ({
//         id: responseSchema?.id || `form_${formId}`,
//         meta,
//         fields: fields.map((f) => ({
//             ...f,
//             value: normalizeFieldValue(
//                 f,
//                 values[f.id] ?? (f.type === "checkbox" ? [] : f.type === "terms" ? false : "")
//             ),
//         })),
//         createdAt: responseSchema?.createdAt || new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         submittedAt: new Date().toISOString(),
//     });

//     const onConfirmSubmit = async () => {
//         try {
//             const { email, mobile } = extractEmailMobile();

//             const responsePayload = buildFormResponsePayload();

//             const res = await updateFormResponseData({
//                 ResponseId: responseId,
//                 FormId: formId,
//                 IPAddress: publicIP || "0.0.0.0",
//                 Status: "Y",
//                 FormResponse: responsePayload,
//                 MobileNo: mobile,
//                 EmailId: email,
//             });

//             if (res?.responseCode !== 101) {
//                 throw new Error(res?.responseMessage || "Failed to update form response");
//             }

//             setConfirmOpen(false);
//             setSuccessTitle("Updated!");
//             setSuccessMsg("Your response was updated successfully.");
//             setSuccessOpen(true);

//             await fetchFormResponseByResponseId(responseId);
//         } catch (err: any) {
//             setConfirmOpen(false);
//             setDangerMsg(err?.message || "Failed to update form response");
//             setDangerOpen(true);
//         }
//     };

//     // ✅ NEW
//     const openRemoveConsentPopup = () => {
//         setRemoveConsentRemark("");
//         setRemoveConsentRemarkError("");
//         setRemoveConsentConfirmOpen(true);
//     };

//     const onRemoveConsent = async () => {
//         const remark = removeConsentRemark.trim();

//         if (!remark) {
//             setRemoveConsentRemarkError("Please enter remark.");
//             return;
//         }

//         try {
//             setRemoveConsentLoading(true);

//             const res = await addConsentRemoveRequest({
//                 ResponseId: responseId,
//                 ConsentRemovalRemark: remark,
//             });

//             if (res?.responseCode !== 101) {
//                 throw new Error(res?.responseMessage || "Consent remove failed");
//             }

//             setRemoveConsentConfirmOpen(false);
//             setRemoveConsentRemark("");
//             setRemoveConsentRemarkError("");
//             setSuccessTitle("Consent Removed!");
//             setSuccessMsg(res.responseMessage || "Consent remove request submitted successfully.");
//             setSuccessOpen(true);
//         } catch (err: any) {
//             setRemoveConsentConfirmOpen(false);
//             setDangerMsg(err?.message || "Consent remove failed");
//             setDangerOpen(true);
//         } finally {
//             setRemoveConsentLoading(false);
//         }
//     };

//     if (!responseId || Number.isNaN(responseId)) {
//         return (
//             <div className="container py-5">
//                 <div className="alert alert-danger mb-0">Invalid response link.</div>
//             </div>
//         );
//     }

//     if (selectedFormResponseByIdLoading) {
//         return (
//             <div className="container py-5">
//                 <div className="text-secondary">Loading form response...</div>
//             </div>
//         );
//     }

//     if (selectedFormResponseByIdError) {
//         return (
//             <div className="container py-5">
//                 <div className="alert alert-danger mb-0">{selectedFormResponseByIdError}</div>
//             </div>
//         );
//     }

//     if (!selectedFormResponseById?.FormResponse || !fields.length) {
//         return (
//             <div className="container py-5">
//                 <div className="text-secondary">Form response not found / no fields.</div>
//             </div>
//         );
//     }

//     const getFieldDescription = (f: BuilderField) => {
//         return (f.description ?? "").trim();
//     };

//     return (
//         <>
//             <div className="shell">
//                 <div className="topbar mb-2 d-flex align-items-center justify-content-between">
//                     <div className="d-flex align-items-center gap-2">
//                         <div className="brand-badge">FF</div>
//                         <div className="lh-sm">
//                             <div className="fw-bold" style={{ fontSize: ".98rem" }}>
//                                 NJ Softtech
//                             </div>
//                             <div className="text-secondary" style={{ fontSize: ".78rem" }}>
//                                 Secure Form
//                             </div>
//                         </div>
//                     </div>

//                     <span className="help-chip d-none d-md-inline">
//                         <i className="bi bi-shield-lock" /> Encrypted
//                     </span>
//                 </div>

//                 <div className="hero mb-2">
//                     <div className="row g-2 align-items-center">
//                         <div className="col-12 col-md-8">
//                             <div className="text-secondary small fw-semibold text-uppercase">
//                                 {meta.category ?? "Registration"}
//                             </div>
//                             <div className="h4 fw-bold mb-1">{meta.title ?? "My Form Details"}</div>
//                             {!!meta.subtitle && (
//                                 <div className="text-secondary small mb-1">{meta.subtitle}</div>
//                             )}
//                             <div className="text-secondary small">
//                                 Fields marked with <span className="req">*</span> are required.
//                             </div>
//                         </div>

//                         <div className="col-12 col-md-4">
//                             <div className="d-flex flex-wrap gap-2 justify-content-md-end">
//                                 <span className="help-chip">
//                                     <i className="bi bi-clock" /> ~2 min
//                                 </span>
//                                 <span className="help-chip">
//                                     <i className="bi bi-envelope" /> Confirm
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="form-card card">
//                     <div className="card-header">
//                         <div className="d-flex align-items-start justify-content-between gap-2">
//                             <div>
//                                 <div className="fw-bold">{meta.title ?? "My Form Details"}</div>
//                                 <div className="text-secondary" style={{ fontSize: ".8rem" }}>
//                                     Powered by NJ Softtech
//                                 </div>
//                             </div>
//                             <span className="badge rounded-pill text-bg-secondary">Details</span>
//                         </div>
//                     </div>

//                     <div className="card-body">
//                         <form noValidate onSubmit={onSubmit}>
//                             <div className="row g-3">
//                                 {fields.map((f) => {
//                                     const err = fieldErrors[f.id] || "";
//                                     const showErr = !!err && (submitted || touched[f.id]);
//                                     const desc = getFieldDescription(f);

//                                     return (
//                                         <div key={f.id} className="col-12">
//                                             <div className="row g-2 align-items-start">
//                                                 <div className="col-12 col-md-6">
//                                                     <label className="form-label fw-semibold">
//                                                         {f.label} {f.required && <span className="req">*</span>}
//                                                     </label>

//                                                     {renderField(
//                                                         f,
//                                                         values[f.id],
//                                                         (v) => handleFieldChange(f, v),
//                                                         () => handleFieldBlur(f),
//                                                         showErr ? err : ""
//                                                     )}

//                                                     {showErr && (
//                                                         <div className="form-text text-danger">
//                                                             {err}
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 <div className="col-12 col-md-6">
//                                                     {!!desc && (
//                                                         <div
//                                                             className="small"
//                                                             style={{
//                                                                 color: "red",
//                                                                 lineHeight: 1.4,
//                                                                 paddingTop: 30,
//                                                                 whiteSpace: "pre-wrap",
//                                                             }}
//                                                         >
//                                                             {desc}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}

//                                 <div className="col-12">
//                                     <div className="d-flex flex-column gap-2">
//                                         <label className="form-check d-flex align-items-start gap-2 mb-0">
//                                             <input
//                                                 className="form-check-input mt-1"
//                                                 type="checkbox"
//                                                 checked={consentTruth}
//                                                 onChange={(e) => setConsentTruth(e.target.checked)}
//                                             />
//                                             <span className="small">
//                                                 I am aware that it is my duty to submit truthful information.
//                                             </span>
//                                         </label>

//                                         <label className="form-check d-flex align-items-start gap-2 mb-0">
//                                             <input
//                                                 className="form-check-input mt-1"
//                                                 type="checkbox"
//                                                 checked={consentDpdp}
//                                                 onChange={(e) => setConsentDpdp(e.target.checked)}
//                                             />
//                                             <span className="small">
//                                                 I hereby provide my free, specific, informed, and unambiguous consent to the
//                                                 Data Fiduciary for the processing, retention, and use of my personal data in
//                                                 accordance with the applicable provisions section 6 of the Digital Personal
//                                                 Data Protection Act, 2023.
//                                             </span>
//                                         </label>

//                                         <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
//                                             <div className="small fw-semibold">Email / sms / Whatsapp OTP</div>

//                                             <div className="position-relative" style={{ maxWidth: 220, width: "100%" }}>
//                                                 <input
//                                                     className={`form-control pe-5 ${otpInput.trim().length === 6
//                                                             ? otpOk
//                                                                 ? "is-valid"
//                                                                 : "is-invalid"
//                                                             : ""
//                                                         }`}
//                                                     placeholder="Enter OTP"
//                                                     value={otpInput}
//                                                     maxLength={6}
//                                                     inputMode="numeric"
//                                                     pattern="[0-9]*"
//                                                     onChange={(e) => {
//                                                         const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
//                                                         setOtpInput(onlyDigits);
//                                                     }}
//                                                 />

//                                                 {otpInput.trim().length === 6 && (
//                                                     <span
//                                                         className="position-absolute top-50 translate-middle-y"
//                                                         style={{ right: 10 }}
//                                                     >
//                                                         {otpOk ? (
//                                                             <i className="bi bi-check-circle-fill right-icon" />
//                                                         ) : (
//                                                             <i className="bi bi-x-circle-fill wrong-icon" />
//                                                         )}
//                                                     </span>
//                                                 )}
//                                             </div>

//                                             <div className="small">for my consent.</div>
//                                             <button
//                                                 type="button"
//                                                 className="btn btn-outline-secondary btn-sm"
//                                                 onClick={generateOtp6}
//                                                 disabled={otpSending}
//                                             >
//                                                 {otpSending ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="col-12 d-flex flex-wrap gap-2 align-items-center justify-content-between pt-1">
//                                     <div className="footer-note d-none d-md-block">
//                                         <i className="bi bi-info-circle" /> Review before submit
//                                     </div>

//                                     <div className="d-flex gap-2 ms-auto">
//                                         <button
//                                             type="button"
//                                             className="btn btn-outline-danger btn-sm"
//                                             style={{ borderRadius: 12 }}
//                                             disabled={!canRemoveConsent || removeConsentLoading}
//                                             title={!canRemoveConsent ? "Please verify OTP to remove consent" : ""}
//                                             onClick={openRemoveConsentPopup}
//                                         >
//                                             {removeConsentLoading ? "Processing..." : "Remove Consent"}
//                                         </button>

//                                         <button
//                                             type="button"
//                                             className="btn btn-outline-secondary btn-sm"
//                                             style={{ borderRadius: 12 }}
//                                             onClick={clearForm}
//                                         >
//                                             Reset
//                                         </button>

//                                         <button
//                                             type="submit"
//                                             className="btn btn-brand btn-sm px-3"
//                                             disabled={!canSubmit}
//                                             title={!canSubmit ? "Please accept consent and verify OTP to submit" : ""}
//                                         >
//                                             <i className="bi bi-send me-1" />
//                                             Update
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </form>
//                     </div>
//                 </div>

//                 <div className="footer-note text-center mt-3">
//                     © {year} NJ Softtech • Form Builder
//                 </div>
//             </div>

//             <PopupAlert
//                 open={confirmOpen}
//                 type="warning"
//                 title="Confirm Update"
//                 message="Are you sure you want to update this form response?"
//                 confirmMode
//                 confirmText="Yes, Update"
//                 cancelText="No"
//                 onClose={() => setConfirmOpen(false)}
//                 onConfirm={onConfirmSubmit}
//                 onCancel={() => setConfirmOpen(false)}
//             />

//             {/* ✅ REMOVE CONSENT MODAL WITH REMARK FIELD */}
//             {removeConsentConfirmOpen && (
//                 <>
//                     <div className="modal-backdrop fade show" />
//                     <div
//                         className="modal fade show d-block"
//                         tabIndex={-1}
//                         role="dialog"
//                         aria-modal="true"
//                     >
//                         <div className="modal-dialog modal-dialog-centered" role="document">
//                             <div className="modal-content">
//                                 <div className="modal-header">
//                                     <h5 className="modal-title">Remove Consent</h5>
//                                     <button
//                                         type="button"
//                                         className="btn-close"
//                                         onClick={() => {
//                                             if (removeConsentLoading) return;
//                                             setRemoveConsentConfirmOpen(false);
//                                         }}
//                                     />
//                                 </div>

//                                 <div className="modal-body">
//                                     <p className="mb-3">
//                                         Please enter remark before sending remove consent request.
//                                     </p>

//                                     <label className="form-label fw-semibold">
//                                         Remark <span className="text-danger">*</span>
//                                     </label>
//                                     <textarea
//                                         className={`form-control ${removeConsentRemarkError ? "is-invalid" : ""}`}
//                                         rows={4}
//                                         placeholder="Enter remark..."
//                                         value={removeConsentRemark}
//                                         onChange={(e) => {
//                                             setRemoveConsentRemark(e.target.value);
//                                             if (e.target.value.trim()) {
//                                                 setRemoveConsentRemarkError("");
//                                             }
//                                         }}
//                                     />
//                                     {removeConsentRemarkError && (
//                                         <div className="invalid-feedback d-block">
//                                             {removeConsentRemarkError}
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="modal-footer">
//                                     <button
//                                         type="button"
//                                         className="btn btn-outline-secondary btn-sm"
//                                         onClick={() => {
//                                             if (removeConsentLoading) return;
//                                             setRemoveConsentConfirmOpen(false);
//                                         }}
//                                     >
//                                         Cancel
//                                     </button>

//                                     <button
//                                         type="button"
//                                         className="btn btn-danger btn-sm"
//                                         onClick={onRemoveConsent}
//                                         disabled={removeConsentLoading}
//                                     >
//                                         {removeConsentLoading ? "Sending..." : "Send Request"}
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}

//             <PopupAlert
//                 open={successOpen}
//                 type="success"
//                 title={successTitle}
//                 message={successMsg}
//                 onClose={() => setSuccessOpen(false)}
//                 autoCloseMs={2000}
//             />

//             <PopupAlert
//                 open={dangerOpen}
//                 type="danger"
//                 title="Error"
//                 message={dangerMsg}
//                 onClose={() => setDangerOpen(false)}
//                 autoCloseMs={2500}
//             />
//         </>
//     );
// };

// export default MyFormDetails;

/**
 * src/formbuilder/myFormDetail.tsx
 *
 * PUBLIC standalone page for users to:
 *   1. View their previously submitted form data (pre-filled)
 *   2. Update their data  →  POST /api/Home/updateFormResponse
 *   3. Send Consent Withdrawal Request  →  POST /api/Home/addConsentRemoveRequest
 *
 * Route (standalone, no sidebar):
 *   /myFormDetails?id={responseId}
 *
 * API used:
 *   GET  /api/Form/getFormResponseById?Id={responseId}   ← fetch pre-filled data
 *   POST /api/Home/updateFormResponse                    ← update submission
 *   POST /api/Home/addConsentRemoveRequest               ← withdraw consent
 *   POST /api/Home/SendOTPMail                           ← OTP for auth
 */

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PopupAlert } from "../Components/alert";
import { getFormResponseByResponseId } from "../Api/getFormResponseByResponseId";
import { updateFormResponseData }       from "../Api/updateFormResponse";
import { addConsentRemoveRequest }       from "../Api/addRemoveConsentRequest";
import { sendOtpMail }                  from "../Api/sendMailOtp";
import type { FormResponseByResponseIdParsed } from "../Api/getFormResponseByResponseId";

/* ─── Types ──────────────────────────────────────────────────────── */

type FieldType =
    | "text" | "email" | "phone" | "number"
    | "dropdown" | "radio" | "checkbox"
    | "date" | "upload" | "terms";

type BuilderField = {
    id: string; type: FieldType; label: string;
    placeholder?: string; required: boolean;
    validation?: { minLength?: number; maxLength?: number; errorMessage?: string; pattern?: string };
    description?: string; descriptionAuto?: boolean;
    options?: { id: string; label: string; value?: string }[];
    numberConfig?: { min?: number; max?: number };
    uploadConfig?: { accept?: string; multiple?: boolean; maxSizeMB?: number };
    termsConfig?: { text?: string };
    locked?: boolean;
    value?: any;
};

type Meta = { title?: string; subtitle?: string; category?: string };

type FormResponseSchema = {
    id?: string; meta?: Meta; fields?: BuilderField[];
    createdAt?: string; updatedAt?: string; submittedAt?: string;
};

/* ─── Validation ─────────────────────────────────────────────────── */

const isPasswordField = (f: BuilderField) => {
    const t = `${f.id} ${f.label} ${f.placeholder ?? ""}`.toLowerCase();
    return t.includes("password") || t.includes("pass word") || t.includes("pwd");
};
const isPhoneField = (f: BuilderField) => {
    const t = `${f.id} ${f.label} ${f.placeholder ?? ""}`.toLowerCase();
    if (t.includes("pincode") || t.includes("pin code") || t.includes("postal") || t.includes("zip")) return false;
    return f.type === "phone" || t.includes("mobile") || t.includes("phone") || t.includes("contact");
};
const isEmailField = (f: BuilderField) => {
    const t = `${f.id} ${f.label} ${f.placeholder ?? ""}`.toLowerCase();
    return f.type === "email" || t.includes("email") || t.includes("e-mail");
};
const isPincodeField = (f: BuilderField) => {
    const t = `${f.id} ${f.label} ${f.placeholder ?? ""}`.toLowerCase();
    return t.includes("pincode") || t.includes("pin code") || t.includes("postal") || t.includes("zip");
};

const validateField = (f: BuilderField, value: any): string => {
    const empty =
        value === null || value === undefined ||
        (typeof value === "string" && !value.trim()) ||
        (Array.isArray(value) && !value.length) ||
        (typeof value === "boolean" && !value && f.type === "terms");

    if (f.required && empty) return f.validation?.errorMessage?.trim() || "This field is required.";
    if (empty) return "";

    const s = typeof value === "string" ? value.trim() : value;

    if (isEmailField(f) && typeof s === "string") {
        const rx = f.validation?.pattern ? new RegExp(f.validation.pattern) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!rx.test(s)) return f.validation?.errorMessage?.trim() || "Please enter a valid email address.";
    }
    if (isPincodeField(f) && typeof s === "string") {
        if (!/^\d{6}$/.test(s.replace(/\D/g, ""))) return "Please enter a valid 6-digit pincode.";
        return "";
    }
    if (isPhoneField(f) && typeof s === "string") {
        if (!/^\d{10}$/.test(s.replace(/\D/g, ""))) return "Please enter a valid 10-digit mobile number.";
        return "";
    }
    if (isPasswordField(f) && typeof s === "string") {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+={}[\]:;"'<>,./\\|`~]).{8,}$/.test(s))
            return "Password must be ≥8 chars with upper, lower, number & special char.";
        return "";
    }
    if (f.type === "number" && s !== "") {
        const n = Number(s);
        if (isNaN(n)) return "Please enter a valid number.";
        if (typeof f.numberConfig?.min === "number" && n < f.numberConfig.min) return `Value must be at least ${f.numberConfig.min}.`;
        if (typeof f.numberConfig?.max === "number" && n > f.numberConfig.max) return `Value must be at most ${f.numberConfig.max}.`;
        return "";
    }
    if (typeof s === "string") {
        if (f.validation?.minLength && s.length < f.validation.minLength) return `Minimum ${f.validation.minLength} characters required.`;
        if (f.validation?.maxLength && s.length > f.validation.maxLength) return `Maximum ${f.validation.maxLength} characters allowed.`;
    }
    return "";
};

/* ─── Field renderer ─────────────────────────────────────────────── */

const ds = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8f9fa" };

const renderField = (
    f: BuilderField,
    value: any,
    setValue: (v: any) => void,
    onBlur?: () => void,
    error?: string
) => {
    const cc = `form-control ${error ? "is-invalid" : ""}`;
    const sc = `form-select ${error ? "is-invalid" : ""}`;

    switch (f.type) {
        case "dropdown": return (
            <select className={sc} required={f.required} value={value ?? ""} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} style={ds}>
                <option value="" style={{ color: "#000" }}>{f.placeholder || "Select..."}</option>
                {(f.options ?? []).map((o) => <option key={o.id} value={o.value ?? o.label} style={{ color: "#000" }}>{o.label}</option>)}
            </select>
        );
        case "radio": return (
            <div className="mt-2">
                {(f.options ?? []).map((o) => {
                    const v = o.value ?? o.label;
                    return (
                        <div key={o.id} className="form-check mb-2">
                            <input className={`form-check-input ${error ? "is-invalid" : ""}`} type="radio" name={f.id} value={v} checked={value === v} required={f.required} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} />
                            <label className="form-check-label text-light">{o.label}</label>
                        </div>
                    );
                })}
            </div>
        );
        case "checkbox": return (
            <div className="mt-2">
                {(f.options ?? []).map((o) => {
                    const v = o.value ?? o.label;
                    const arr: string[] = Array.isArray(value) ? value : [];
                    return (
                        <div key={o.id} className="form-check mb-2">
                            <input className={`form-check-input ${error ? "is-invalid" : ""}`} type="checkbox" checked={arr.includes(v)} onChange={(e) => { if (e.target.checked) setValue([...arr, v]); else setValue(arr.filter((x) => x !== v)); }} onBlur={onBlur} />
                            <label className="form-check-label text-light">{o.label}</label>
                        </div>
                    );
                })}
            </div>
        );
        case "number":  return <input className={cc} type="number" placeholder={f.placeholder || ""} min={f.numberConfig?.min} max={f.numberConfig?.max} required={f.required} value={value ?? ""} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} style={ds} />;
        case "email":   return <input className={cc} type="email" placeholder={f.placeholder || ""} required={f.required} value={value ?? ""} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} style={ds} />;
        case "phone":   return <input className={cc} type="text" inputMode="numeric" placeholder={f.placeholder || ""} required={f.required} value={value ?? ""} onChange={(e) => { const d = e.target.value.replace(/\D/g, ""); const mx = f.validation?.maxLength; setValue(mx ? d.slice(0, mx) : d); }} onBlur={onBlur} style={ds} />;
        case "date":    return <input className={cc} type="date" required={f.required} value={value ?? ""} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} style={ds} />;
        case "upload":  return <input className={cc} type="file" accept={f.uploadConfig?.accept} multiple={!!f.uploadConfig?.multiple} required={f.required} onChange={(e) => { const files = (e.target as HTMLInputElement).files; if (!files) return setValue(null); setValue(f.uploadConfig?.multiple ? Array.from(files) : files[0] ?? null); }} onBlur={onBlur} style={ds} />;
        case "terms":   return <label className="d-flex align-items-start gap-2 text-light"><input type="checkbox" required={f.required} checked={!!value} onChange={(e) => setValue(e.target.checked)} onBlur={onBlur} className="mt-1" /><span>{f.termsConfig?.text ?? "I agree to the terms"}</span></label>;
        default:        return <input className={cc} type={isPasswordField(f) ? "password" : "text"} placeholder={f.placeholder || ""} required={f.required} value={value ?? ""} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} style={ds} />;
    }
};

/* ─── Main Component ─────────────────────────────────────────────── */

const MyFormDetails: React.FC = () => {
    const [searchParams] = useSearchParams();
    // Supports both ?id= and ?responseId=
    const responseId = Number(searchParams.get("id") || searchParams.get("responseId"));

    /* ── Data fetching state ──────────────────────────────────────── */
    const [record, setRecord]         = useState<FormResponseByResponseIdParsed | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError]     = useState("");

    /* ── Public IP (for update payload) ──────────────────────────── */
    const [publicIP, setPublicIP] = useState("0.0.0.0");

    /* ── Form state ───────────────────────────────────────────────── */
    const [values, setValues]           = useState<Record<string, any>>({});
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [submitted, setSubmitted]     = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [touched, setTouched]         = useState<Record<string, boolean>>({});

    /* ── OTP state ────────────────────────────────────────────────── */
    const [consentTruth, setConsentTruth] = useState(false);
    const [consentDpdp,  setConsentDpdp]  = useState(false);
    const [otpServer,    setOtpServer]    = useState("");
    const [otpInput,     setOtpInput]     = useState("");
    const [otpSent,      setOtpSent]      = useState(false);
    const [otpSending,   setOtpSending]   = useState(false);

    /* ── Modals / alerts ──────────────────────────────────────────── */
    const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
    const [consentModalOpen,  setConsentModalOpen]  = useState(false);
    const [consentRemark,     setConsentRemark]     = useState("");
    const [consentRemarkErr,  setConsentRemarkErr]  = useState("");
    const [consentLoading,    setConsentLoading]    = useState(false);

    const [successOpen, setSuccessOpen] = useState(false);
    const [successTitle, setSuccessTitle] = useState("Success");
    const [successMsg,  setSuccessMsg]  = useState("");
    const [dangerOpen,  setDangerOpen]  = useState(false);
    const [dangerMsg,   setDangerMsg]   = useState("Something went wrong!");

    const year = useMemo(() => new Date().getFullYear(), []);

    /* ── Fetch public IP ──────────────────────────────────────────── */
    useEffect(() => {
        fetch("https://api.ipify.org?format=json")
            .then((r) => r.json())
            .then((d) => setPublicIP(d.ip || "0.0.0.0"))
            .catch(() => {});
    }, []);

    /* ── Step 1: Fetch response data by responseId ────────────────── */
    useEffect(() => {
        if (!responseId || isNaN(responseId)) return;

        const load = async () => {
            setDataLoading(true);
            setDataError("");
            try {
                // GET /api/Form/getFormResponseById?Id={responseId}
                const data = await getFormResponseByResponseId(responseId);
                if (!data) { setDataError("No response found for this ID."); return; }
                setRecord(data);
            } catch (err: any) {
                setDataError(err?.message || "Failed to load form data.");
            } finally {
                setDataLoading(false);
            }
        };

        load();
    }, [responseId]);

    /* ── Step 2: Parse FormResponse and pre-fill values ──────────── */
    const schema: FormResponseSchema | null = record?.FormResponse as FormResponseSchema ?? null;
    const fields: BuilderField[]            = schema?.fields ?? [];
    const meta: Meta                        = schema?.meta   ?? {};
    const formId                            = record?.FormId ?? 0;

    useEffect(() => {
        if (!fields.length) return;

        const init: Record<string, any> = {};
        for (const f of fields) {
            // ← Use stored value from the DB response (pre-fill)
            if (f.value !== undefined && f.value !== null) {
                init[f.id] = f.value;
            } else if (f.type === "checkbox") {
                init[f.id] = [];
            } else if (f.type === "terms") {
                init[f.id] = false;
            } else {
                init[f.id] = "";
            }
        }

        setValues(init);
        setInitialValues(init);
        setSubmitted(false);
        setFieldErrors({});
        setTouched({});
        setConsentTruth(false);
        setConsentDpdp(false);
        setOtpServer("");
        setOtpInput("");
        setOtpSent(false);
    }, [record, fields.length]);

    /* ── Validation ───────────────────────────────────────────────── */
    const validateAll = () => {
        const e: Record<string, string> = {};
        for (const f of fields) { const m = validateField(f, values[f.id]); if (m) e[f.id] = m; }
        return e;
    };
    const handleChange = (f: BuilderField, v: any) => {
        setValues((p) => ({ ...p, [f.id]: v }));
        setFieldErrors((p) => ({ ...p, [f.id]: validateField(f, v) }));
        setTouched((p) => ({ ...p, [f.id]: true }));
    };
    const handleBlur = (f: BuilderField) => {
        setFieldErrors((p) => ({ ...p, [f.id]: validateField(f, values[f.id]) }));
        setTouched((p) => ({ ...p, [f.id]: true }));
    };

    const resetForm = () => {
        setValues(initialValues);
        setSubmitted(false); setFieldErrors({}); setTouched({});
        setConsentTruth(false); setConsentDpdp(false);
        setOtpServer(""); setOtpInput(""); setOtpSent(false);
    };

    /* ── Email / mobile extraction ────────────────────────────────── */
    const extractEmailMobile = () => {
        let email = "", mobile = "";
        for (const f of fields) {
            const v = values[f.id];
            if (!email  && (f.type === "email" || /email/i.test(f.id)  || /email/i.test(f.label)))  { if (typeof v === "string") email  = v.trim(); }
            if (!mobile && (f.type === "phone" || /mobile/i.test(f.id) || /phone/i.test(f.id) || /mobile/i.test(f.label) || /phone/i.test(f.label))) { if (typeof v === "string") mobile = v.trim(); }
        }
        return { email, mobile };
    };

    /* ── OTP ──────────────────────────────────────────────────────── */
    const sendOtp = async () => {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        setOtpServer(otp); setOtpSent(true); setOtpInput("");
        try {
            const { email } = extractEmailMobile();
            if (!email) { setDangerMsg("Email not found in form."); setDangerOpen(true); return; }
            setOtpSending(true);
            await sendOtpMail({ ToEmail: email, OTP: otp, ExpiryMinutes: 5 });
        } catch (err: any) {
            setDangerMsg(err?.message || "OTP email failed"); setDangerOpen(true);
        } finally {
            setOtpSending(false);
        }
    };
    const otpOk     = otpServer.length === 6 && otpInput.trim() === otpServer;
    const canUpdate = consentTruth && consentDpdp && otpOk;
    const canWithdraw = otpOk;   // OTP required for consent withdraw too

    /* ── Submit (update) form ─────────────────────────────────────── */
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault(); setSubmitted(true);
        const errs = validateAll(); setFieldErrors(errs);
        const at: Record<string, boolean> = {}; for (const f of fields) at[f.id] = true; setTouched(at);
        if (Object.keys(errs).length) return;
        setConfirmUpdateOpen(true);
    };

    const normalizeValue = (f: BuilderField, v: any) => {
        if (f.type === "upload") {
            if (Array.isArray(v)) return v.map((x: File) => x instanceof File ? { name: x.name, size: x.size, type: x.type } : x);
            if (v instanceof File) return { name: v.name, size: v.size, type: v.type };
            return v ?? null;
        }
        return v;
    };

    const onConfirmUpdate = async () => {
        try {
            const { email, mobile } = extractEmailMobile();
            const payload = {
                id: schema?.id || `form_${formId}`,
                meta,
                fields: fields.map((f) => ({ ...f, value: normalizeValue(f, values[f.id] ?? (f.type === "checkbox" ? [] : f.type === "terms" ? false : "")) })),
                createdAt:   schema?.createdAt   || new Date().toISOString(),
                updatedAt:   new Date().toISOString(),
                submittedAt: new Date().toISOString(),
            };

            // POST /api/Home/updateFormResponse
            const res = await updateFormResponseData({
                ResponseId: responseId,
                FormId:     formId,
                IPAddress:  publicIP,
                Status:     "Y",
                FormResponse: payload,
                MobileNo: mobile,
                EmailId:  email,
            });

            if (res?.responseCode !== 101) throw new Error(res?.responseMessage || "Update failed");

            setConfirmUpdateOpen(false);
            setSuccessTitle("Updated!");
            setSuccessMsg("Your form data has been updated successfully.");
            setSuccessOpen(true);

            // Refresh data
            const fresh = await getFormResponseByResponseId(responseId);
            if (fresh) setRecord(fresh);
        } catch (err: any) {
            setConfirmUpdateOpen(false);
            setDangerMsg(err?.message || "Update failed");
            setDangerOpen(true);
        }
    };

    /* ── Consent Withdraw ─────────────────────────────────────────── */
    const openConsentModal = () => {
        setConsentRemark(""); setConsentRemarkErr("");
        setConsentModalOpen(true);
    };

    const submitConsentWithdraw = async () => {
        const remark = consentRemark.trim();
        if (!remark) { setConsentRemarkErr("Please enter a reason for withdrawal."); return; }

        try {
            setConsentLoading(true);

            // POST /api/Home/addConsentRemoveRequest
            const res = await addConsentRemoveRequest({
                ResponseId: responseId,
                ConsentRemovalRemark: remark,
            });

            if (res?.responseCode !== 101) throw new Error(res?.responseMessage || "Request failed");

            setConsentModalOpen(false);
            setSuccessTitle("Request Submitted");
            setSuccessMsg("Your consent withdrawal request has been submitted. The Data Fiduciary will process it under DPDP Act, 2023.");
            setSuccessOpen(true);
        } catch (err: any) {
            setConsentModalOpen(false);
            setDangerMsg(err?.message || "Consent withdrawal failed");
            setDangerOpen(true);
        } finally {
            setConsentLoading(false);
        }
    };

    /* ── Guard states ─────────────────────────────────────────────── */
    if (!responseId || isNaN(responseId)) {
        return (
            <div className="shell d-flex align-items-center justify-content-center min-vh-100" style={{ background: "#0b0c10" }}>
                <div className="text-center p-4">
                    <i className="bi bi-exclamation-triangle-fill text-warning mb-3 d-block" style={{ fontSize: 40 }} />
                    <h5 className="text-white">Invalid Link</h5>
                    <p className="text-secondary">This link is missing a valid response ID. Please use the link provided to you.</p>
                </div>
            </div>
        );
    }

    if (dataLoading) {
        return (
            <div className="shell d-flex align-items-center justify-content-center min-vh-100" style={{ background: "#0b0c10" }}>
                <div className="text-center">
                    <div className="spinner-border mb-3" style={{ width: "2.5rem", height: "2.5rem", color: "#4f6ef7" }} />
                    <div className="text-secondary">Loading your form data…</div>
                </div>
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="shell d-flex align-items-center justify-content-center min-vh-100" style={{ background: "#0b0c10" }}>
                <div className="text-center p-4">
                    <i className="bi bi-x-circle-fill text-danger mb-3 d-block" style={{ fontSize: 40 }} />
                    <h5 className="text-white">Could Not Load Data</h5>
                    <p className="text-secondary">{dataError}</p>
                </div>
            </div>
        );
    }

    if (!fields.length) {
        return (
            <div className="shell d-flex align-items-center justify-content-center min-vh-100" style={{ background: "#0b0c10" }}>
                <div className="text-secondary">No form fields found.</div>
            </div>
        );
    }

    /* ── Render ───────────────────────────────────────────────────── */
    return (
        <>
            <div className="shell d-flex flex-column align-items-center min-vh-100 py-4" style={{ background: "#0b0c10" }}>
                <div style={{ maxWidth: 820, width: "100%", padding: "0 16px" }}>

                    {/* Topbar */}
                    <div className="mb-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ width: 44, height: 44, background: "#4f6ef7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>FF</div>
                            <div>
                                <div className="fw-bold text-white fs-5">NJ Softtech</div>
                                <div className="small fw-semibold" style={{ color: "#7c9ff7" }}>My Form Details</div>
                            </div>
                        </div>
                        <span className="badge d-none d-md-flex align-items-center gap-2 py-2 px-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", borderRadius: 8 }}>
                            <i className="bi bi-shield-lock" style={{ color: "#3dd68c" }} /> Encrypted
                        </span>
                    </div>

                    {/* Info chip — response metadata */}
                    <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
                        <span style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)", color: "#7c9ff7", borderRadius: 6, padding: "4px 12px", fontSize: 12 }}>
                            <i className="bi bi-fingerprint me-1" />Response #{responseId}
                        </span>
                        <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#adb5bd", borderRadius: 6, padding: "4px 12px", fontSize: 12 }}>
                            <i className="bi bi-envelope me-1" />{record?.EmailId || "—"}
                        </span>
                        <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#adb5bd", borderRadius: 6, padding: "4px 12px", fontSize: 12 }}>
                            <i className="bi bi-telephone me-1" />{record?.MobileNo || "—"}
                        </span>
                        {record?.CreatedOn && (
                            <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#adb5bd", borderRadius: 6, padding: "4px 12px", fontSize: 12 }}>
                                <i className="bi bi-calendar3 me-1" />Submitted {new Date(record.CreatedOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                        )}
                    </div>

                    {/* Main card */}
                    <div className="card shadow-lg border-0" style={{ background: "#11131a", borderRadius: 16 }}>

                        {/* Card header */}
                        <div className="card-header border-0 p-4" style={{ background: "transparent", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="text-uppercase fw-bold mb-1" style={{ fontSize: "0.72rem", color: "#7c9ff7", letterSpacing: "1px" }}>
                                {meta.category ?? "Registration"}
                            </div>
                            <div className="fw-bold text-white fs-4 mb-1">{meta.title ?? "My Form"}</div>
                            {meta.subtitle && <div style={{ fontSize: ".9rem", color: "#94a3b8" }}>{meta.subtitle}</div>}

                            {/* DPDP notice strip */}
                            <div className="mt-3 p-3 d-flex align-items-start gap-2" style={{ background: "rgba(79,110,247,0.07)", borderRadius: 10, border: "1px solid rgba(79,110,247,0.15)" }}>
                                <i className="bi bi-info-circle text-primary mt-1 flex-shrink-0" />
                                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                                    Your previously submitted data is shown below. You may <strong className="text-white">update your information</strong> or submit a <strong className="text-white">Consent Withdrawal Request</strong> under the Digital Personal Data Protection Act, 2023 (Section 12 & 13).
                                </div>
                            </div>
                        </div>

                        {/* Card body — form */}
                        <div className="card-body p-4 p-md-5 text-white">
                            <form noValidate onSubmit={onSubmit}>
                                <div className="row g-4">

                                    {/* Fields */}
                                    {fields.map((f) => {
                                        const err     = fieldErrors[f.id] || "";
                                        const showErr = !!err && (submitted || touched[f.id]);
                                        const desc    = (f.description ?? "").trim();

                                        return (
                                            <div key={f.id} className="col-12">
                                                <div className="row g-3 align-items-start">
                                                    <div className="col-12 col-md-7">
                                                        <label className="form-label fw-semibold text-light mb-2">
                                                            {f.label} {f.required && <span className="text-danger">*</span>}
                                                        </label>
                                                        {renderField(f, values[f.id], (v) => handleChange(f, v), () => handleBlur(f), showErr ? err : "")}
                                                        {showErr && (
                                                            <div className="form-text text-danger mt-1">
                                                                <i className="bi bi-exclamation-circle me-1" />{err}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-12 col-md-5">
                                                        {desc && (
                                                            <div className="small p-3" style={{ background: "rgba(79,110,247,0.05)", border: "1px solid rgba(79,110,247,0.1)", borderRadius: 8, color: "#94a3b8", lineHeight: 1.5, marginTop: 28, whiteSpace: "pre-wrap" }}>
                                                                <i className="bi bi-info-circle text-primary me-2" />{desc}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* OTP + Consent block */}
                                    <div className="col-12 mt-2">
                                        <div className="p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                                            <h6 className="fw-bold mb-3" style={{ color: "#7c9ff7" }}>
                                                <i className="bi bi-shield-check me-2" />Verification & Consent
                                            </h6>

                                            <div className="d-flex flex-column gap-3 mb-4">
                                                <label className="form-check d-flex align-items-start gap-3 mb-0" style={{ cursor: "pointer" }}>
                                                    <input className="form-check-input mt-1" type="checkbox" style={{ transform: "scale(1.2)" }} checked={consentTruth} onChange={(e) => setConsentTruth(e.target.checked)} />
                                                    <span className="small text-light" style={{ lineHeight: 1.5 }}>I am aware that it is my duty to submit truthful information.</span>
                                                </label>

                                                <label className="form-check d-flex align-items-start gap-3 mb-0" style={{ cursor: "pointer" }}>
                                                    <input className="form-check-input mt-1" type="checkbox" style={{ transform: "scale(1.2)" }} checked={consentDpdp} onChange={(e) => setConsentDpdp(e.target.checked)} />
                                                    <span className="small text-light" style={{ lineHeight: 1.5 }}>
                                                        I hereby provide my free, specific, informed, and unambiguous consent to the Data Fiduciary for the processing, retention, and use of my personal data in accordance with the applicable provisions of the <strong className="text-white">Digital Personal Data Protection Act, 2023</strong>.
                                                    </span>
                                                </label>
                                            </div>

                                            {/* OTP row */}
                                            <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 pt-3" style={{ borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                                                <div className="small fw-semibold text-light text-nowrap">Email / SMS OTP</div>
                                                <div className="position-relative" style={{ maxWidth: 200, width: "100%" }}>
                                                    <input
                                                        className={`form-control ${otpInput.trim().length === 6 ? otpOk ? "is-valid" : "is-invalid" : ""}`}
                                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                                                        placeholder="Enter 6-digit OTP"
                                                        value={otpInput} maxLength={6} inputMode="numeric" pattern="[0-9]*"
                                                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                    />
                                                    {otpInput.trim().length === 6 && (
                                                        <span className="position-absolute top-50 translate-middle-y" style={{ right: 12 }}>
                                                            {otpOk ? <i className="bi bi-check-circle-fill text-success" /> : <i className="bi bi-x-circle-fill text-danger" />}
                                                        </span>
                                                    )}
                                                </div>
                                                <button type="button" className="btn btn-sm text-nowrap" style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)", color: "#7c9ff7" }} onClick={sendOtp} disabled={otpSending}>
                                                    {otpSending ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : otpSent ? "Resend OTP" : "Send OTP"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="col-12 mt-2 pt-4 d-flex flex-wrap gap-3 align-items-center justify-content-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div className="d-none d-md-block text-secondary small">
                                            <i className="bi bi-pencil-square me-1" />Review your data before updating
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 ms-auto">
                                            {/* Consent Withdraw */}
                                            <button
                                                type="button"
                                                className="btn btn-sm px-3"
                                                style={{ background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.25)", color: "#f86e7a", borderRadius: 8 }}
                                                disabled={!canWithdraw || consentLoading}
                                                title={!canWithdraw ? "Verify OTP first to withdraw consent" : ""}
                                                onClick={openConsentModal}
                                            >
                                                <i className="bi bi-shield-x me-1" />
                                                {consentLoading ? "Processing…" : "Withdraw Consent"}
                                            </button>

                                            {/* Reset */}
                                            <button type="button" className="btn btn-sm px-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 8 }} onClick={resetForm}>
                                                Reset
                                            </button>

                                            {/* Update */}
                                            <button type="submit" className="btn btn-sm px-4 fw-bold d-flex align-items-center gap-2" style={{ background: "#4f6ef7", color: "#fff", border: "none", borderRadius: 8 }} disabled={!canUpdate} title={!canUpdate ? "Accept consent and verify OTP to update" : ""}>
                                                <i className="bi bi-arrow-repeat" />Update Info
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="text-center mt-4 mb-5" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem" }}>
                        © {year} NJ Softtech · Consent Management Portal · DPDP Act, 2023
                    </div>
                </div>
            </div>

            {/* ── Confirm Update popup ──────────────────────────────── */}
            <PopupAlert
                open={confirmUpdateOpen}
                type="warning"
                title="Confirm Update"
                message="Are you sure you want to update your form data? This will replace your previously submitted information."
                confirmMode confirmText="Yes, Update" cancelText="Cancel"
                onClose={() => setConfirmUpdateOpen(false)}
                onConfirm={onConfirmUpdate}
                onCancel={() => setConfirmUpdateOpen(false)}
            />

            {/* ── Consent Withdraw Modal ────────────────────────────── */}
            {consentModalOpen && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
                    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: 480 }}>
                            <div className="modal-content" style={{ background: "#11131a", border: "1px solid rgba(220,53,69,0.25)", borderRadius: 14 }}>

                                <div className="modal-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(220,53,69,0.06)" }}>
                                    <h5 className="modal-title d-flex align-items-center gap-2 text-white">
                                        <i className="bi bi-shield-x text-danger" />
                                        Consent Withdrawal Request
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => { if (!consentLoading) setConsentModalOpen(false); }} />
                                </div>

                                <div className="modal-body p-4">
                                    <div className="mb-3 p-3" style={{ background: "rgba(220,53,69,0.07)", borderRadius: 8, border: "1px solid rgba(220,53,69,0.15)", fontSize: 13, color: "#f8d7da" }}>
                                        <i className="bi bi-info-circle me-2" />
                                        Under <strong>Section 12 of the DPDP Act, 2023</strong>, you have the right to withdraw your consent at any time. The Data Fiduciary will process this request and notify you.
                                    </div>

                                    <label className="form-label fw-semibold text-light">
                                        Reason for Withdrawal <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className={`form-control ${consentRemarkErr ? "is-invalid" : ""}`}
                                        rows={4}
                                        placeholder="Please explain why you wish to withdraw your consent (e.g., data no longer needed, incorrect data, etc.)..."
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8f9fa", resize: "vertical" }}
                                        value={consentRemark}
                                        onChange={(e) => { setConsentRemark(e.target.value); if (e.target.value.trim()) setConsentRemarkErr(""); }}
                                    />
                                    {consentRemarkErr && <div className="invalid-feedback d-block">{consentRemarkErr}</div>}

                                    <div className="mt-2" style={{ fontSize: 12, color: "#6c757d" }}>
                                        <i className="bi bi-clock me-1" />Requests are typically processed within 30 days.
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                    <button type="button" className="btn btn-sm btn-outline-secondary px-4" onClick={() => { if (!consentLoading) setConsentModalOpen(false); }}>Cancel</button>
                                    <button type="button" className="btn btn-sm btn-danger px-4" onClick={submitConsentWithdraw} disabled={consentLoading}>
                                        {consentLoading ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : <><i className="bi bi-send me-1" />Send Request</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Alerts ────────────────────────────────────────────── */}
            <PopupAlert open={successOpen} type="success" title={successTitle} message={successMsg} onClose={() => setSuccessOpen(false)} autoCloseMs={3000} />
            <PopupAlert open={dangerOpen}  type="danger"  title="Error"         message={dangerMsg}  onClose={() => setDangerOpen(false)}  autoCloseMs={3000} />
        </>
    );
};

export default MyFormDetails;