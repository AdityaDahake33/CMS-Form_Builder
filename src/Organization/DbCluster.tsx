import React, { useState, useEffect } from "react";
import { getOrganizations, type OrganizationRow } from "../Api/Organization/getOrganizationList";

const DbCluster = () => {
    const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [totalOrgs, setTotalOrgs] = useState(0);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            setError("");
            const { rows, total } = await getOrganizations({
                status: "Y",
                PageNumber: 1,
                PageSize: 10,
                SortOrder: "DESC",
            });
            setOrganizations(rows);
            setTotalOrgs(total);
        } catch (err: any) {
            setError(err?.message || "Failed to fetch organizations");
            setOrganizations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const stats = [
        { label: "HEALTHY CLUSTERS", value: totalOrgs.toString(), color: "#22c55e" },
        { label: "NEAR LIMIT", value: "0", color: "#f59e0b" },
        { label: "CRITICAL", value: "0", color: "#ef4444" },
        { label: "TOTAL ORGANIZATIONS", value: totalOrgs.toString(), color: "#1f8bff" },
    ];

    const clusters = organizations.map((org, index) => ({
        id: org.Id,
        name: org.OrgName || `Organization ${index + 1}`,
        status: org.Status === "Y" ? "HEALTHY" : "CRITICAL",
        storageUsed: Math.random() * 5 + 1,
        storageTotal: 10,
        consents: "—",
        uptime: "99.9%",
        region: `${org.City || "Unknown"}, ${org.State || "Unknown"}`,
        icon: "bi-building",
    }));

    return (
        <div className="container-fluid app-shell">
            <div className="row g-0">
                <div className="panel mb-3">
                    <div className="panel-head p-3">
                        <div className="h4 mb-1">DB Clusters</div>
                        <div className="text-secondary small">Service Provider ➜ Management ➜ Database Clusters</div>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="panel mb-3">
                        <div className="alert alert-danger mb-0">{error}</div>
                    </div>
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="panel mb-3">
                        <div className="p-3 text-center text-secondary small">
                            <i className="bi bi-arrow-repeat spin me-2"></i>
                            Loading clusters...
                        </div>
                    </div>
                )}

                <div className="panel mb-3">
                    <div className="p-3">
                        <span className="chip">DATABASE CLUSTERS — Each organisation has an isolated cluster · Monitor health, storage & performance</span>
                    </div>
                </div>

                <div className="row g-3 mb-3">
                    {stats.map((s) => (
                        <div key={s.label} className="col-12 col-md-6 col-xl-3">
                            <div className="stat-card">
                                <div className="text-secondary small">{s.label}</div>
                                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="d-flex flex-column gap-3">
                    {!loading && clusters.length === 0 && (
                        <div className="panel p-4 text-center text-secondary small">
                            No clusters available.
                        </div>
                    )}
                    {clusters.map((c) => (
                        <div className="panel" key={c.id}>
                            <div className="panel-head p-3 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2 fw-bold fs-5">
                                    <i className={`bi ${c.icon}`} />
                                    {c.name}
                                </div>
                                <span className={`badge rounded-pill ${c.status === "HEALTHY" ? "text-bg-success" : "text-bg-warning"}`}>
                                    {c.status}
                                </span>
                            </div>
                            <div className="p-3">
                                <div className="progress mb-3">
                                    <div className="progress-bar" style={{ width: `${(c.storageUsed / c.storageTotal) * 100}%` }} />
                                </div>

                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-xl-3">
                                        <div className="panel p-3 h-100">
                                            <div className="text-secondary small">Storage</div>
                                            <div className="fw-bold fs-4">{c.storageUsed} / {c.storageTotal} GB</div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6 col-xl-3">
                                        <div className="panel p-3 h-100">
                                            <div className="text-secondary small">Consents</div>
                                            <div className="fw-bold fs-4">{c.consents}</div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6 col-xl-3">
                                        <div className="panel p-3 h-100">
                                            <div className="text-secondary small">Uptime</div>
                                            <div className="fw-bold fs-4">{c.uptime}</div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6 col-xl-3">
                                        <div className="panel p-3 h-100">
                                            <div className="text-secondary small">Region</div>
                                            <div className="fw-bold fs-4">{c.region}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 mt-3 flex-wrap">
                                    <button className="btn btn-outline-secondary btn-sm">View Logs</button>
                                    <button className="btn btn-outline-secondary btn-sm">Expand Storage</button>
                                    <button className="btn btn-outline-secondary btn-sm">Force Backup</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DbCluster;   

