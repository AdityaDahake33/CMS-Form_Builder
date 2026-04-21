import React, { useState, useEffect } from "react";
import { getAdminDashboard } from "../Api/Admin/getDashboardDetails";

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

const EVENT_TYPES = [
    "All Event Types",
    "Action",
    "Success",
    "Update",
    "Withdrawal",
    "Error",
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
    const [, setTick] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");
    const [eventType, setEventType] = useState("All Event Types");

    // Real-time updates every second
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch logs from dashboard API
    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getAdminDashboard();
            console.log("Dashboard API Response:", data);
            console.log("Activity Logs:", data?.activityLogs);
            if (data?.activityLogs) {
                const mappedLogs: LogEntry[] = data.activityLogs.map((item: any, index: number) => {
                    // Use correct API field names
                    const text = item?.activity || `Activity ${index + 1}`;
                    const time = item?.created || "";
                    
                    // Parse user from activity text (extract email from parentheses)
                    let user = "—";
                    const emailMatch = text.match(/\(([^@]+@[^)]+)\)/);
                    if (emailMatch) {
                        user = emailMatch[1];
                    } else {
                        // Try to extract username from parentheses (non-email)
                        const userMatch = text.match(/\(([^)]+)\)/);
                        if (userMatch) {
                            user = userMatch[1].trim();
                        }
                    }
                    
                    // Parse form/response number from activity text (extract numbers in parentheses)
                    let form = "—";
                    const numberMatch = text.match(/\((\d+)\)/);
                    if (numberMatch) {
                        form = `Response No. ${numberMatch[1]}`;
                    }
                    
                    // Format time for display
                    let displayTime = "—";
                    if (time) {
                        try {
                            const date = new Date(time);
                            if (!isNaN(date.getTime())) {
                                displayTime = date.toLocaleString('en-IN', { 
                                    hour12: false,
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                });
                            }
                        } catch {
                            displayTime = time;
                        }
                    }

                    // Determine icon and color based on activity type
                    let icon = "bi-info-circle";
                    let iconColor = "#3b82f6";
                    let status: LogStatus = "Info";
                    let eventTypeDisplay = "Action";

                    const textLower = text.toLowerCase();
                    if (textLower.includes("new") || textLower.includes("created")) {
                        icon = "bi-check2-circle";
                        iconColor = "#22c55e";
                        status = "OK";
                        eventTypeDisplay = "Success";
                    } else if (textLower.includes("updated") || textLower.includes("update")) {
                        icon = "bi-pencil";
                        iconColor = "#f59e0b";
                        status = "Pending";
                        eventTypeDisplay = "Update";
                    } else if (textLower.includes("consent removal")) {
                        icon = "bi-arrow-counterclockwise";
                        iconColor = "#3b82f6";
                        status = "Pending";
                        eventTypeDisplay = "Withdrawal";
                    } else if (textLower.includes("action taken")) {
                        icon = "bi-check-circle";
                        iconColor = "#22c55e";
                        status = "OK";
                        eventTypeDisplay = "Action";
                    }

                    return {
                        id: index + 1,
                        time: displayTime,
                        icon,
                        iconColor,
                        title: text,
                        titleHighlight: form !== "—" ? `— ${form}` : "",
                        subtitle: user !== "—" ? `User: ${user}` : "",
                        status,
                        eventType: eventTypeDisplay,
                    };
                });
                setLogs(mappedLogs);
            } else {
                setLogs([]);
            }
        } catch (err: any) {
            setError(err?.message || "Failed to fetch logs");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filtered = logs.filter((l) => {
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

                {/* ── Error message ── */}
                {error && (
                    <div className="panel mb-3">
                        <div className="alert alert-danger mb-0">{error}</div>
                    </div>
                )}

                {/* ── Loading indicator ── */}
                {loading && (
                    <div className="panel mb-3">
                        <div className="p-3 text-center text-secondary small">
                            <i className="bi bi-arrow-repeat spin me-2"></i>
                            Loading logs...
                        </div>
                    </div>
                )}


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
                                placeholder="Filter by event type, user or form..."
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

                        <button 
                            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 text-nowrap"
                            onClick={() => fetchLogs()}
                        >
                            <i className="bi bi-arrow-clockwise" />
                            Refresh
                        </button>

                        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 text-nowrap">
                            <i className="bi bi-download" />
                            Export Logs
                        </button>
                    </div>
                </div>

                {/* ── Log entries ── */}
                <div className="d-flex flex-column gap-2 mb-4">
                    {!loading && logs.length === 0 && (
                        <div className="panel p-4 text-center text-secondary small">
                            No log entries available.
                        </div>
                    )}
                    {filtered.length === 0 && logs.length > 0 && (
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
