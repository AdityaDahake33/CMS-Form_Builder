import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PopupAlert } from "../Components/alert";
import { getFormResponseByResponseId } from "../Api/getFormResponseByResponseId";
import { updateFormResponseData }       from "../Api/updateFormResponse";
import { addConsentRemoveRequest }       from "../Api/addRemoveConsentRequest";
import { sendOtpMail }                  from "../Api/sendMailOtp";
import { submitGrievance }              from "../Api/grievance";
import type { FormResponseByResponseIdParsed } from "../Api/getFormResponseByResponseId";
import type { GrievanceType }           from "../Api/grievance";

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

/* ─── Grievance issue types ──────────────────────────────────────── */

const GRIEVANCE_ISSUE_TYPES: GrievanceType[] = [
    "Data Access Request",
    "Data Correction Request",
    "Data Deletion / Erasure",
    "Consent Withdrawal",
    "Data Breach Concern",
    "Unauthorised Processing",
    "Data Portability",
    "Other",
];

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
    const responseId = Number(searchParams.get("id") || searchParams.get("responseId"));

    /* ── Data fetching state ──────────────────────────────────────── */
    const [record, setRecord]           = useState<FormResponseByResponseIdParsed | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError]     = useState("");

    /* ── Public IP ────────────────────────────────────────────────── */
    const [publicIP, setPublicIP] = useState("0.0.0.0");

    /* ── Form state ───────────────────────────────────────────────── */
    const [values, setValues]               = useState<Record<string, any>>({});
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [submitted, setSubmitted]         = useState(false);
    const [fieldErrors, setFieldErrors]     = useState<Record<string, string>>({});
    const [touched, setTouched]             = useState<Record<string, boolean>>({});

    /* ── OTP / Consent state ──────────────────────────────────────── */
    const [consentTruth, setConsentTruth] = useState(false);
    const [consentDpdp,  setConsentDpdp]  = useState(false);
    const [otpServer,    setOtpServer]    = useState("");
    const [otpInput,     setOtpInput]     = useState("");
    const [otpSent,      setOtpSent]      = useState(false);
    const [otpSending,   setOtpSending]   = useState(false);

    /* ── Update confirm modal ─────────────────────────────────────── */
    const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);

    /* ── Consent Withdraw modal ───────────────────────────────────── */
    const [consentModalOpen,  setConsentModalOpen]  = useState(false);
    const [consentRemark,     setConsentRemark]     = useState("");
    const [consentRemarkErr,  setConsentRemarkErr]  = useState("");
    const [consentLoading,    setConsentLoading]    = useState(false);

    /* ── Grievance modal ─────────────────────────────────────────── */
    const [grievanceModalOpen,      setGrievanceModalOpen]      = useState(false);
    const [grievanceIssueType,      setGrievanceIssueType]      = useState<GrievanceType>("Other");
    const [grievanceDescription,    setGrievanceDescription]    = useState("");
    const [grievanceDescErr,        setGrievanceDescErr]        = useState("");
    const [grievanceIssueTypeErr,   setGrievanceIssueTypeErr]   = useState("");
    const [grievanceLoading,        setGrievanceLoading]        = useState(false);

    /* ── Alerts ───────────────────────────────────────────────────── */
    const [successOpen,  setSuccessOpen]  = useState(false);
    const [successTitle, setSuccessTitle] = useState("Success");
    const [successMsg,   setSuccessMsg]   = useState("");
    const [dangerOpen,   setDangerOpen]   = useState(false);
    const [dangerMsg,    setDangerMsg]    = useState("Something went wrong!");

    const year = useMemo(() => new Date().getFullYear(), []);

    /* ── Fetch public IP ──────────────────────────────────────────── */
    useEffect(() => {
        fetch("[https://api.ipify.org?format=json](https://api.ipify.org?format=json)")
            .then((r) => r.json())
            .then((d) => setPublicIP(d.ip || "0.0.0.0"))
            .catch(() => {});
    }, []);

    /* ── Fetch response data ──────────────────────────────────────── */
    useEffect(() => {
        if (!responseId || isNaN(responseId)) return;
        const load = async () => {
            setDataLoading(true);
            setDataError("");
            try {
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

    /* ── Parse schema ─────────────────────────────────────────────── */
    const schema: FormResponseSchema | null = record?.FormResponse as FormResponseSchema ?? null;
    const fields: BuilderField[]            = schema?.fields ?? [];
    const meta: Meta                        = schema?.meta   ?? {};
    const formId                            = record?.FormId ?? 0;

    /* ── Pre-fill values ──────────────────────────────────────────── */
    useEffect(() => {
        if (!fields.length) return;
        const init: Record<string, any> = {};
        for (const f of fields) {
            if (f.value !== undefined && f.value !== null) init[f.id] = f.value;
            else if (f.type === "checkbox") init[f.id] = [];
            else if (f.type === "terms") init[f.id] = false;
            else init[f.id] = "";
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

    /* ── Validation helpers ───────────────────────────────────────── */
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
            if (!email  && (f.type === "email"  || /email/i.test(f.id)  || /email/i.test(f.label)))  { if (typeof v === "string") email  = v.trim(); }
            if (!mobile && (f.type === "phone"  || /mobile/i.test(f.id) || /phone/i.test(f.id) || /mobile/i.test(f.label) || /phone/i.test(f.label))) { if (typeof v === "string") mobile = v.trim(); }
        }
        return { email, mobile };
    };

    /* Extract user name from fields for grievance payload */
    const extractUserName = () => {
        for (const f of fields) {
            const v = values[f.id];
            if (typeof v === "string" && v.trim() && /name/i.test(f.label)) return v.trim();
        }
        return "User";
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
    const otpOk       = otpServer.length === 6 && otpInput.trim() === otpServer;
    const canUpdate   = consentTruth && consentDpdp && otpOk;
    const canWithdraw = otpOk;

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
            const res = await updateFormResponseData({
                ResponseId: responseId, FormId: formId,
                IPAddress: publicIP, Status: "Y",
                FormResponse: payload, MobileNo: mobile, EmailId: email,
            });
            if (res?.responseCode !== 101) throw new Error(res?.responseMessage || "Update failed");
            setConfirmUpdateOpen(false);
            setSuccessTitle("Updated!");
            setSuccessMsg("Your form data has been updated successfully.");
            setSuccessOpen(true);
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
            const res = await addConsentRemoveRequest({ ResponseId: responseId, ConsentRemovalRemark: remark });
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

    /* ── Grievance ────────────────────────────────────────────────── */
    const openGrievanceModal = () => {
        setGrievanceIssueType("Other");
        setGrievanceDescription("");
        setGrievanceDescErr("");
        setGrievanceIssueTypeErr("");
        setGrievanceModalOpen(true);
    };

    const submitGrievanceHandler = async () => {
        let valid = true;
        if (!grievanceIssueType) {
            setGrievanceIssueTypeErr("Please select an issue type.");
            valid = false;
        } else {
            setGrievanceIssueTypeErr("");
        }
        if (!grievanceDescription.trim()) {
            setGrievanceDescErr("Please describe your issue.");
            valid = false;
        } else {
            setGrievanceDescErr("");
        }
        if (!valid) return;

        try {
            setGrievanceLoading(true);
            const { email, mobile } = extractEmailMobile();
            const userName = extractUserName();

            await submitGrievance({
                ConsentId:        `CNS-${responseId}`,
                UserName:         userName,
                UserEmail:        email,
                UserMobile:       mobile,
                IssueType:        grievanceIssueType,
                IssueDescription: grievanceDescription.trim(),
                Priority:         "Medium",
                FormId:           formId,
            });

            setGrievanceModalOpen(false);
            setSuccessTitle("Grievance Submitted");
            setSuccessMsg("Your grievance has been submitted. Our team will review it and respond to your registered email address.");
            setSuccessOpen(true);
        } catch (err: any) {
            setGrievanceModalOpen(false);
            setDangerMsg(err?.message || "Failed to submit grievance");
            setDangerOpen(true);
        } finally {
            setGrievanceLoading(false);
        }
    };

    /* ── Guard states ─────────────────────────────────────────────── */
    if (!responseId || isNaN(responseId)) {
        return (
            <div className="shell d-flex align-items-center justify-content-center min-vh-100" style={{ background: "#0b0c10" }}>
                <div className="text-center p-4">
                    <i className="bi bi-exclamation-triangle-fill text-warning mb-3 d-block" style={{ fontSize: 40 }} />
                    <h5 className="text-white">Invalid Link</h5>
                    <p className="text-secondary">This link is missing a valid response ID.</p>
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

    /* ─── Shared modal backdrop style ────────────────────────────── */
    const backdropStyle: React.CSSProperties = { zIndex: 1050 };
    const modalStyle:    React.CSSProperties = { zIndex: 1055 };
    const modalContentBase: React.CSSProperties = {
        background: "#11131a",
        borderRadius: 14,
    };

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

                    {/* Info chips */}
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

                            {/* DPDP notice */}
                            <div className="mt-3 p-3 d-flex align-items-start gap-2" style={{ background: "rgba(79,110,247,0.07)", borderRadius: 10, border: "1px solid rgba(79,110,247,0.15)" }}>
                                <i className="bi bi-info-circle text-primary mt-1 flex-shrink-0" />
                                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                                    Your previously submitted data is shown below. You may <strong className="text-white">update your information</strong>, submit a <strong className="text-white">Consent Withdrawal Request</strong>, or raise a <strong className="text-white">Grievance</strong> under the Digital Personal Data Protection Act, 2023.
                                </div>
                            </div>
                        </div>

                        {/* Card body */}
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
                                                <button
                                                    type="button"
                                                    className="btn btn-sm text-nowrap"
                                                    style={{ background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.2)", color: "#7c9ff7" }}
                                                    onClick={sendOtp}
                                                    disabled={otpSending}
                                                >
                                                    {otpSending ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : otpSent ? "Resend OTP" : "Send OTP"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Action buttons ──────────────────────────────── */}
                                    <div className="col-12 mt-2 pt-4 d-flex flex-wrap gap-3 align-items-center justify-content-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div className="d-none d-md-block text-secondary small">
                                            <i className="bi bi-pencil-square me-1" />Review your data before updating
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 ms-auto">

                                            {/* ── Grievance button ── */}
                                            <button
                                                type="button"
                                                className="btn btn-sm px-3"
                                                style={{
                                                    background: "rgba(255,193,7,0.1)",
                                                    border: "1px solid rgba(255,193,7,0.3)",
                                                    color: "#ffc107",
                                                    borderRadius: 8,
                                                }}
                                                onClick={openGrievanceModal}
                                                title="Raise a grievance about your data"
                                            >
                                                <i className="bi bi-exclamation-triangle me-1" />
                                                Grievance
                                            </button>

                                            {/* ── Consent Withdraw ── */}
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

                                            {/* ── Reset ── */}
                                            <button
                                                type="button"
                                                className="btn btn-sm px-3"
                                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 8 }}
                                                onClick={resetForm}
                                            >
                                                Reset
                                            </button>

                                            {/* ── Update ── */}
                                            <button
                                                type="submit"
                                                className="btn btn-sm px-4 fw-bold d-flex align-items-center gap-2"
                                                style={{ background: "#4f6ef7", color: "#fff", border: "none", borderRadius: 8 }}
                                                disabled={!canUpdate}
                                                title={!canUpdate ? "Accept consent and verify OTP to update" : ""}
                                            >
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

            {/* ══════════════════════════════════════════════════════
                CONFIRM UPDATE POPUP (FIXED)
            ══════════════════════════════════════════════════════ */}
            <PopupAlert
                open={confirmUpdateOpen}
                type="warning"
                title="Confirm Update"
                message="Are you sure you want to update your form data? This will replace your previously submitted information."
                confirmMode confirmText="Yes, Update" cancelText="Cancel"
                onClose={() => setConfirmUpdateOpen(false)}
                onConfirm={onConfirmUpdate}  /* 🔥 FIXED TYPO HERE */
                onCancel={() => setConfirmUpdateOpen(false)}
            />

            {/* ══════════════════════════════════════════════════════
                CONSENT WITHDRAW MODAL
            ══════════════════════════════════════════════════════ */}
            {consentModalOpen && (
                <>
                    <div className="modal-backdrop fade show" style={backdropStyle} />
                    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={modalStyle}>
                        <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: 480 }}>
                            <div className="modal-content" style={{ ...modalContentBase, border: "1px solid rgba(220,53,69,0.25)" }}>

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
                                        placeholder="Please explain why you wish to withdraw your consent..."
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

            {/* ══════════════════════════════════════════════════════
                GRIEVANCE MODAL
            ══════════════════════════════════════════════════════ */}
            {grievanceModalOpen && (
                <>
                    <div className="modal-backdrop fade show" style={backdropStyle} />
                    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={modalStyle}>
                        <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: 520 }}>
                            <div className="modal-content" style={{ ...modalContentBase, border: "1px solid rgba(255,193,7,0.25)" }}>

                                {/* Header */}
                                <div className="modal-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,193,7,0.06)" }}>
                                    <h5 className="modal-title d-flex align-items-center gap-2 text-white">
                                        <i className="bi bi-exclamation-triangle text-warning" />
                                        Raise a Grievance
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => { if (!grievanceLoading) setGrievanceModalOpen(false); }}
                                    />
                                </div>

                                {/* Body */}
                                <div className="modal-body p-4">

                                    {/* Info strip */}
                                    <div className="mb-4 p-3" style={{ background: "rgba(255,193,7,0.07)", borderRadius: 8, border: "1px solid rgba(255,193,7,0.15)", fontSize: 13, color: "#fff3cd" }}>
                                        <i className="bi bi-info-circle me-2" />
                                        Under <strong>Section 13 of the DPDP Act, 2023</strong>, you have the right to file a grievance with the Data Fiduciary. Our team will review your grievance and respond to your registered email address.
                                    </div>

                                    {/* Issue Type */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-light">
                                            Issue Type <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${grievanceIssueTypeErr ? "is-invalid" : ""}`}
                                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8f9fa" }}
                                            value={grievanceIssueType}
                                            onChange={(e) => {
                                                setGrievanceIssueType(e.target.value as GrievanceType);
                                                if (e.target.value) setGrievanceIssueTypeErr("");
                                            }}
                                        >
                                            <option value="" style={{ color: "#000" }}>Select issue type...</option>
                                            {GRIEVANCE_ISSUE_TYPES.map((t) => (
                                                <option key={t} value={t} style={{ color: "#000" }}>{t}</option>
                                            ))}
                                        </select>
                                        {grievanceIssueTypeErr && (
                                            <div className="invalid-feedback d-block">{grievanceIssueTypeErr}</div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="mb-2">
                                        <label className="form-label fw-semibold text-light">
                                            Describe Your Issue <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            className={`form-control ${grievanceDescErr ? "is-invalid" : ""}`}
                                            rows={5}
                                            placeholder="Please describe your grievance in detail. Include relevant dates, form names, or any other information that will help us resolve your issue promptly..."
                                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8f9fa", resize: "vertical", fontSize: 13 }}
                                            value={grievanceDescription}
                                            onChange={(e) => {
                                                setGrievanceDescription(e.target.value);
                                                if (e.target.value.trim()) setGrievanceDescErr("");
                                            }}
                                        />
                                        {grievanceDescErr && (
                                            <div className="invalid-feedback d-block">{grievanceDescErr}</div>
                                        )}
                                        <div className="mt-1" style={{ fontSize: 11, color: "#6c757d" }}>
                                            {grievanceDescription.length} characters
                                        </div>
                                    </div>

                                    {/* Response info */}
                                    <div className="mt-3 d-flex align-items-center gap-2" style={{ fontSize: 12, color: "#6c757d" }}>
                                        <i className="bi bi-envelope me-1" />
                                        A resolution will be emailed to: <strong style={{ color: "#adb5bd" }}>{record?.EmailId || "your registered email"}</strong>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary px-4"
                                        onClick={() => { if (!grievanceLoading) setGrievanceModalOpen(false); }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm px-4"
                                        style={{ background: "#ffc107", border: "none", color: "#000", fontWeight: 600 }}
                                        onClick={submitGrievanceHandler}
                                        disabled={grievanceLoading}
                                    >
                                        {grievanceLoading
                                            ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
                                            : <><i className="bi bi-send me-1" />Submit Grievance</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Alerts ────────────────────────────────────────────── */}
            <PopupAlert open={successOpen} type="success" title={successTitle} message={successMsg} onClose={() => setSuccessOpen(false)} autoCloseMs={3500} />
            <PopupAlert open={dangerOpen}  type="danger"  title="Error"         message={dangerMsg}  onClose={() => setDangerOpen(false)}  autoCloseMs={3000} />
        </>
    );
};

export default MyFormDetails;