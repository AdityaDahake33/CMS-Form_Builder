import React, { useState } from "react";

// ── Types
type LogStatus = "OK" | "Pending" | "Critical" | "Info";

interface LogEntry {
    id: number;
    time: string;
    icon: string;
    iconColor: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    status: LogStatus;
    eventType: string;
}

// ── Static demo data 
const DEMO_LOGS: LogEntry[] = [
    {
        id: 1,
        time: "14:32:10",
        icon: "bi-check2-circle",
        iconColor: "#22c55e",
        title: "New consent captured",
        titleHighlight: "— CST-1004 for Survey Participation",
        subtitle: "Platform · User ID-1351 · 192.168.1.33 · Chrome",
        status: "OK",
        eventType: "Consent",
    },
    {
        id: 2,
        time: "14:26:50",
        icon: "bi-arrow-counterclockwise",
        iconColor: "#3b82f6",
        title: "Withdrawal request filed",
        titleHighlight: "— CST-1055 for Patient Record Sharing",
        subtitle: "TechnoEdge · User DP-2294 · 46.9.1.45 · Firefox",
        status: "Pending",
        eventType: "Withdrawal",
    },
    {
        id: 3,
        time: "13:58:44",
        icon: "bi-exclamation-triangle-fill",
        iconColor: "#ef4444",
        title: "Data breach alert raised",
        titleHighlight: "— Unauthorised access to consent DB detected",
        subtitle: "FinServ Corp · Org-Shree · IP: 202.3.115.88",
        status: "Critical",
        eventType: "Security",
    },
    {
        id: 4,
        time: "11:04:53",
        icon: "bi-building-check",
        iconColor: "#22c55e",
        title: "New organisation onboarded",
        titleHighlight: "— EduLearn Academy (Pro plan)",
        subtitle: "Platform · NJ Admin · IP: 10.0.0.5",
        status: "OK",
        eventType: "Organisation",
    },
    {
        id: 5,
        time: "11:00:08",
        icon: "bi-file-earmark-check",
        iconColor: "#22c55e",
        title: "Consent form created",
        titleHighlight: "— Annual Employee Survey form deployed",
        subtitle: "TechnoEdge · Org Admin · IP: 172.16.0.3",
        status: "OK",
        eventType: "Form",
    },
    {
        id: 6,
        time: "11:03:39",
        icon: "bi-shield-lock-fill",
        iconColor: "#22c55e",
        title: "MFA login successful",
        titleHighlight: "— Service Provider admin login",
        subtitle: "Platform · NJ Admin · IP: 10.0.0.1 · Chrome",
        status: "OK",
        eventType: "Auth",
    },
    {
        id: 7,
        time: "11:28:08",
        icon: "bi-clock-history",
        iconColor: "#f59e0b",
        title: "Consent auto-expired",
        titleHighlight: "— 12 consents expired past retention period",
        subtitle: "GlobalRetail Org · System · Auto-process",
        status: "Info",
        eventType: "Consent",
    },
];

const EVENT_TYPES = [
    "All Event Types",
    "Consent",
    "Withdrawal",
    "Security",
    "Organisation",
    "Form",
    "Auth",
];

// ── Badge styles 
const statusBadge = (s: LogStatus) => {
    const base = "badge rounded-pill fw-semibold px-2 py-1";
    switch (s) {
        case "OK":       return `${base} text-bg-success`;
        case "Pending":  return `${base} text-bg-warning`;
        case "Critical": return `${base} text-bg-danger`;
        case "Info":     return `${base} badge-soft`;
    }
};

// ── Component 
const Logs: React.FC = () => {
    const [filter, setFilter]       = useState("");
    const [eventType, setEventType] = useState("All Event Types");

    const filtered = DEMO_LOGS.filter((l) => {
        const q = filter.trim().toLowerCase();
        const matchText =
            q === "" ||
            l.title.toLowerCase().includes(q) ||
            l.titleHighlight.toLowerCase().includes(q) ||
            l.subtitle.toLowerCase().includes(q) ||
            l.eventType.toLowerCase().includes(q);
        const matchType =
            eventType === "All Event Types" || l.eventType === eventType;
        return matchText && matchType;
    });

    return (
        <div className="container-fluid app-shell">
            <div className="row g-0">

                {/* ── Page header ── */}
                <div className="panel mb-3">
                    <div className="panel-head p-3">
                        <div className="h4 mb-1">Audit Logs</div>
                        <div className="text-secondary small">
                            Service Provider ➜ Compliance ➜ Audit Logs
                        </div>
                    </div>
                </div>


                {/* ── Info chip bar ── */}
                <div className="panel mb-3">
                    <div className="p-3">
                        <span className="chip">
                            AUDIT LOGS — Immutable tamper-evident logs &nbsp;·&nbsp;
                            DPDP Section 8 &amp; 16 compliance &nbsp;·&nbsp;
                            Evidence-grade records
                        </span>
                    </div>
                </div>

                {/* ── Filter bar ── */}
                <div className="panel mb-3">
                    <div className="p-3 d-flex flex-wrap gap-2 align-items-center">
                        <div className="flex-grow-1 position-relative" style={{ minWidth: 220 }}>
                            <i
                                className="bi bi-search position-absolute"
                                style={{ left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.45, pointerEvents: "none" }}
                            />
                            <input
                                className="form-control ps-4"
                                placeholder="Filter by event type, actor or org..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>

                        <select
                            className="form-select"
                            style={{ width: "auto", minWidth: 168 }}
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                        >
                            {EVENT_TYPES.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>

                        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 text-nowrap">
                            <i className="bi bi-download" />
                            Export Logs
                        </button>
                    </div>
                </div>

                {/* ── Log entries ── */}
                <div className="d-flex flex-column gap-2 mb-4">
                    {filtered.length === 0 && (
                        <div className="panel p-4 text-center text-secondary small">
                            No log entries match your filter.
                        </div>
                    )}

                    {filtered.map((log) => (
                        <div
                            key={log.id}
                            className="panel px-3 py-2 d-flex align-items-center justify-content-between gap-3"
                        >
                            {/* Time */}
                            <div
                                className="text-secondary small text-nowrap flex-shrink-0"
                                style={{ minWidth: 56, fontVariantNumeric: "tabular-nums", fontSize: "0.78rem" }}
                            >
                                {log.time}
                            </div>

                            {/* Icon bubble */}
                            <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    background: `${log.iconColor}22`,
                                    color: log.iconColor,
                                    fontSize: 14,
                                }}
                            >
                                <i className={`bi ${log.icon}`} />
                            </div>

                            {/* Text */}
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <div className="fw-semibold small" style={{ lineHeight: 1.45 }}>
                                    {log.title}
                                    <span className="text-secondary fw-normal"> {log.titleHighlight}</span>
                                </div>
                                <div className="text-secondary" style={{ fontSize: "0.74rem", marginTop: 1 }}>
                                    {log.subtitle}
                                </div>
                            </div>

                            {/* Status badge */}
                            <div className="flex-shrink-0">
                                <span className={statusBadge(log.status)}>{log.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Logs;
