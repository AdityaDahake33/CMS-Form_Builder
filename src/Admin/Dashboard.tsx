import React, { useMemo, useEffect, useState } from "react";
import { useProject } from "../Context/projectContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type StatCard = {
    label: string;
    value: number | string;
    note: React.ReactNode;
    iconClass: string;
};

type ActivityBadge = "New" | "Edit" | "User" | "Action";
type ActivityRow = {
    badge: ActivityBadge;
    text: string;
    user: string;
    form: string;
    time: string;
};

const badgeClass = (b: ActivityBadge) => {
    if (b === "New") return "badge text-bg-success rounded-pill me-2";
    if (b === "Edit") return "badge text-bg-warning rounded-pill me-2";
    if (b === "User") return "badge text-bg-secondary rounded-pill me-2";
    return "badge text-bg-primary rounded-pill me-2";
};

const formatRelativeTime = (dateStr: string) => {
    if (!dateStr || dateStr === "—") return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return date.toLocaleString("en-IN");
};

const Dashboard: React.FC = () => {
    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const { dashboard, dashboardLoading, dashboardError } = useProject();

    /* 🔥 INFOGRAPHIC DATA */
    const chartData = [
        { name: "Approved", value: dashboard?.totalApprovedActionTaken ?? 0 },
        { name: "Rejected", value: dashboard?.totalRejectedActionTaken ?? 0 },
        { name: "Pending", value: dashboard?.totalPendingConsentRemoveRequest ?? 0 },
    ];

    const COLORS = ["#22c55e", "#ef4444", "#facc15"];

    /* EXISTING */
    const stats: StatCard[] = [
        { label: "Total Users", value: dashboard?.totalUsers ?? 0, note: <>All registered users</>, iconClass: "bi bi-people fs-5" },
        { label: "Total Forms", value: dashboard?.totalForms ?? 0, note: <>All available forms</>, iconClass: "bi bi-ui-checks-grid fs-5" },
        { label: "Total Form Responses", value: dashboard?.totalFormResponse ?? 0, note: <>Responses received</>, iconClass: "bi bi-chat-square-text fs-5" },
        { label: "Consent Remove Requests", value: dashboard?.totalConsentRemoveRequest ?? 0, note: <>All consent removal requests</>, iconClass: "bi bi-file-earmark-minus fs-5" },
        { label: "Pending Requests", value: dashboard?.totalPendingConsentRemoveRequest ?? 0, note: <>Awaiting action</>, iconClass: "bi bi-hourglass-split fs-5" },
        { label: "Action Taken", value: dashboard?.totalConsentRequestActionTaken ?? 0, note: <>Processed requests</>, iconClass: "bi bi-check2-square fs-5" },
        { label: "Approved Actions", value: dashboard?.totalApprovedActionTaken ?? 0, note: <>Approved consent actions</>, iconClass: "bi bi-check-circle fs-5" },
        { label: "Rejected Actions", value: dashboard?.totalRejectedActionTaken ?? 0, note: <>Rejected consent actions</>, iconClass: "bi bi-x-circle fs-5" },
    ];

    const rows: ActivityRow[] = useMemo(() => {
        if (!dashboard?.activityLogs?.length) {
            return [{ badge: "Action", text: "No recent activity available", user: "—", form: "—", time: "—" }];
        }

        return dashboard.activityLogs.map((item: any, index: number) => {
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

            return {
                badge: "Action",
                text: text,
                user: user,
                form: form,
                time: time,
            };
        });
    }, [dashboard]);

    return (
        <div className="container-fluid app-shell">
            <div className="row g-0">

                {/* Header */}
                <div className="panel mb-3">
                    <div className="panel-head p-3">
                        <div className="h5 mb-1">Admin Dashboard</div>
                        <div className="text-secondary small">Overview of your platform metrics</div>
                    </div>
                </div>

                {/* Error */}
                {dashboardError && (
                    <div className="col-12 mb-3">
                        <div className="alert alert-danger mb-0">{dashboardError}</div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="row g-4 mb-3">
                    {stats.map((s) => (
                        <div key={s.label} className="col-12 col-md-6 col-xl-3">
                            <div className="stat-card h-100" style={{ padding: "1.25rem" }}>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <div className="text-secondary small">{s.label}</div>
                                        <div className="stat-value" style={{ fontSize: "1.5rem" }}>{dashboardLoading ? "..." : s.value}</div>
                                    </div>
                                    <i className={s.iconClass} style={{ fontSize: "1.5rem" }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Panels */}
                <div className="row g-3">

                    {/* Recent Activity */}
                    <div className="col-12 col-xl-7">
                        <div className="panel h-100">
                            <div className="panel-head p-3 d-flex justify-content-between">
                                <div className="fw-bold">Recent Activity</div>
                                <span className="badge badge-soft">Live</span>
                            </div>

                            <div className="p-3" style={{ maxHeight: 500, overflowY: "auto" }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "40%" }}>Event</th>
                                            <th style={{ width: "25%" }} className="text-center">User</th>
                                            <th style={{ width: "20%" }} className="text-center">Form</th>
                                            <th style={{ width: "15%" }} className="text-end">Time</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map((r, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <span className={badgeClass(r.badge)}>{r.badge}</span>
                                                    {r.text}
                                                </td>
                                                <td className="text-center">{r.user}</td>
                                                <td className="text-center">{r.form}</td>
                                                <td className="text-end" title={r.time}>
                                                    {formatRelativeTime(r.time)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 🔥 INFOGRAPHIC (REPLACES STATUS BREAKDOWN) */}
                    <div className="col-12 col-xl-5">
                        <div className="panel h-100 p-3">

                            <div className="fw-bold mb-3">Analytics Overview</div>

                            <div style={{ height: 260 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            dataKey="value"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={4}
                                        >
                                            {chartData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend */}
                            <div className="mt-3">
                                {chartData.map((item, i) => (
                                    <div key={i} className="d-flex justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: "50%",
                                                background: COLORS[i]
                                            }} />
                                            <span className="text-secondary">{item.name}</span>
                                        </div>
                                        <span className="fw-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                </div>

                {/* 🔥 KEEP THIS PART UNCHANGED */}
                {/* Extra Info Cards */}
                <div className="row g-3 mt-1">
                    <div className="col-12 col-md-6 col-xl-4">
                        <div className="stat-card h-100">
                            <div>
                                <div className="text-secondary small font700">Role ID</div>
                                <div className="stat-value">{dashboard?.roleId ?? 0}</div>
                                <div className="mini-note mt-1">Current admin role</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <div className="stat-card h-100">
                            <div>
                                <div className="text-secondary small font700">Approval Rate</div>
                                <div className="stat-value">
                                    {dashboard && dashboard.totalConsentRequestActionTaken > 0
                                        ? `${Math.round((dashboard.totalApprovedActionTaken / dashboard.totalConsentRequestActionTaken) * 100)}%`
                                        : "0%"}
                                </div>
                                <div className="mini-note mt-1">Approved out of total actions</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <div className="stat-card h-100">
                            <div>
                                <div className="text-secondary small font700">Rejection Rate</div>
                                <div className="stat-value">
                                    {dashboard && dashboard.totalConsentRequestActionTaken > 0
                                        ? `${Math.round((dashboard.totalRejectedActionTaken / dashboard.totalConsentRequestActionTaken) * 100)}%`
                                        : "0%"}
                                </div>
                                <div className="mini-note mt-1">Rejected out of total actions</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;