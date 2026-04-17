import { useEffect, useMemo, useState } from "react";
import { useProject } from "../Context/projectContext";
import { Skeleton } from "../Components/loader";
import { PopupAlert } from "../Components/alert";
import { addConsentRemoveRequestAction } from "../Api/addRemoveConsentRequestAction";

const TableSkeletonRows: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={`sk_${i}`}>
                    <td>
                        <Skeleton height={16} width="70%" />
                        <div className="mt-2">
                            <Skeleton height={12} width="50%" />
                        </div>
                    </td>

                    <td>
                        <Skeleton height={14} width={120} />
                    </td>

                    <td>
                        <Skeleton height={14} width={120} />
                    </td>

                    <td>
                        <Skeleton height={18} width={90} radius={50} />
                    </td>

                    <td>
                        <Skeleton height={18} width={90} radius={50} />
                    </td>

                    <td>
                        <Skeleton height={14} width={120} />
                    </td>

                    <td className="text-end">
                        <Skeleton height={32} width={100} radius={8} />
                    </td>
                </tr>
            ))}
        </>
    );
};

type RequestStatusUI = "All" | "Pending" | "Resolved";
type SortUI = "Newest" | "Oldest";

const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const safeString = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
};

const badgeClass = (type: "success" | "warning" | "secondary" | "danger") => {
    if (type === "success") return "badge text-bg-success rounded-pill";
    if (type === "warning") return "badge text-bg-warning rounded-pill";
    if (type === "danger") return "badge text-bg-danger rounded-pill";
    return "badge text-bg-secondary rounded-pill";
};

const getConsentBadge = (value?: string) => {
    return value === "Y"
        ? { text: "Withdraw Requested", className: badgeClass("warning") }
        : { text: "No Request", className: badgeClass("secondary") };
};

const getResolvedBadge = (value?: string) => {
    return value === "Y"
        ? { text: "Resolved", className: badgeClass("success") }
        : { text: "Pending", className: badgeClass("danger") };
};

const getUserName = (row: any, id: string) => {
    let potentialName = "";
    
    // Try to extract user name from FormResponse object (actual form data submitted by user)
    if (row.FormResponse && typeof row.FormResponse === "object") {
        // Check if FormResponse has fields array (typical form structure)
        if (row.FormResponse.fields && Array.isArray(row.FormResponse.fields)) {
            // Look through form fields for name-related fields
            for (const field of row.FormResponse.fields) {
                if (field && field.value) {
                    const fieldName = (field.name || field.label || field.id || "").toLowerCase();
                    const fieldValue = String(field.value).trim();
                    
                    // Check for common name field patterns
                    if (fieldName.includes('name') && fieldValue && fieldValue !== '') {
                        // Prioritize full name fields
                        if (fieldName.includes('full') || fieldName === 'name') {
                            return fieldValue;
                        }
                        // Store as potential name if it's a single name field
                        if (!potentialName) {
                            potentialName = fieldValue;
                        }
                    }
                }
            }
            
            // Return potential name if found
            if (potentialName) {
                return potentialName;
            }
        }
        
        // Check for direct name properties in FormResponse
        const formResponseName = row.FormResponse.FullName ||
                                row.FormResponse.Name ||
                                row.FormResponse.fullName ||
                                row.FormResponse.name ||
                                row.FormResponse.CustomerName ||
                                row.FormResponse.customerName ||
                                row.FormResponse.UserName ||
                                row.FormResponse.userName ||
                                row.FormResponse.FirstName ||
                                row.FormResponse.firstName;
        
        if (formResponseName) return String(formResponseName);
    }
    
    // Try direct fields in the row object (fallback)
    const directName = row.FullName ||
                       row.Name ||
                       row.fullName ||
                       row.name ||
                       row.CustomerName ||
                       row.customerName ||
                       row.UserName ||
                       row.userName ||
                       row.FirstName ||
                       row.firstName;
    
    if (directName) return String(directName);
    
    // Try to combine first and last name if available
    const firstName = row.FirstName || row.firstName || row.FormResponse?.FirstName || row.FormResponse?.firstName;
    const lastName = row.LastName || row.lastName || row.FormResponse?.LastName || row.FormResponse?.lastName;
    
    if (firstName && lastName) {
        return `${String(firstName)} ${String(lastName)}`;
    }
    
    if (firstName) return String(firstName);
    if (lastName) return String(lastName);
    
    // Final fallback with more descriptive text
    return `User ${id}`;
};

export default function ConsentWithdrawRequest() {
    const {
        consentRemoveRequests,
        consentRemoveRequestsTotal,
        consentRemoveRequestsLoading,
        consentRemoveRequestsError,
        consentRemoveRequestParams,
        refreshConsentRemoveRequests,
    } = useProject();

    const [initialized, setInitialized] = useState(false);
    const [search, setSearch] = useState<string>(consentRemoveRequestParams.searchString ?? "");
    const [status, setStatus] = useState<RequestStatusUI>("All");
    const [sort, setSort] = useState<SortUI>(
        (consentRemoveRequestParams.sortOrder ?? "DESC") === "ASC" ? "Oldest" : "Newest"
    );

    const [actionOpen, setActionOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [actionRemark, setActionRemark] = useState("");
    const [actionRemarkError, setActionRemarkError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const [successOpen, setSuccessOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [dangerOpen, setDangerOpen] = useState(false);
    const [dangerMsg, setDangerMsg] = useState("");

    const page = consentRemoveRequestParams.pageNumber ?? 1;
    const pageSize = consentRemoveRequestParams.pageSize ?? 10;

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil((consentRemoveRequestsTotal || 0) / pageSize));
    }, [consentRemoveRequestsTotal, pageSize]);


    const initialSearch = consentRemoveRequestParams.searchString ?? "";


    useEffect(() => {
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!initialized) return;
        if (search === initialSearch) return;

        const t = setTimeout(() => {
            refreshConsentRemoveRequests({
                pageNumber: 1,
                searchColumn: "Search",
                searchString: search.trim(),
            });
        }, 400);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, initialized]);

    const onChangeStatus = async (v: RequestStatusUI) => {
        setStatus(v);

        if (v === "All") {
            await refreshConsentRemoveRequests({
                pageNumber: 1,
                searchColumn: "",
                searchString: "",
            });
            return;
        }

        if (v === "Pending") {
            await refreshConsentRemoveRequests({
                pageNumber: 1,
                searchColumn: "ConsentResolved",
                searchString: "N",
            });
            return;
        }

        await refreshConsentRemoveRequests({
            pageNumber: 1,
            searchColumn: "ConsentResolved",
            searchString: "Y",
        });
    };

    const onChangeSort = async (v: SortUI) => {
        setSort(v);
        await refreshConsentRemoveRequests({
            pageNumber: 1,
            sortColumn: "CreatedOn",
            sortOrder: v === "Oldest" ? "ASC" : "DESC",
        });
    };

    const goToPage = async (p: number) => {
        const next = Math.max(1, Math.min(totalPages, p));
        await refreshConsentRemoveRequests({ pageNumber: next });
    };

    const openActionPopup = (row: any) => {
        setSelectedRow(row);
        setActionRemark("");
        setActionRemarkError("");
        setActionOpen(true);
    };

    const handleAction = async (statusValue: "Y" | "N") => {
        const remark = actionRemark.trim();

        if (!remark) {
            setActionRemarkError("Please enter remark.");
            return;
        }

        if (!selectedRow?.Id) {
            setDangerMsg("Invalid request selected.");
            setDangerOpen(true);
            return;
        }

        try {
            setActionLoading(true);

            const res = await addConsentRemoveRequestAction({
                ResponseId: selectedRow.Id,
                ConsentActionRemark: remark,
                Status: statusValue,
            });

            setActionOpen(false);
            setSelectedRow(null);
            setActionRemark("");
            setActionRemarkError("");

            setSuccessMsg(
                res?.responseMessage ||
                (statusValue === "Y"
                    ? "Consent request approved successfully."
                    : "Consent request rejected successfully.")
            );
            setSuccessOpen(true);

            await refreshConsentRemoveRequests();
        } catch (err: any) {
            setDangerMsg(err?.message || "Consent action failed");
            setDangerOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const tableRows = useMemo(() => {
        return consentRemoveRequests.map((r) => {
            const consentBadge = getConsentBadge(r.Consent);
            const resolvedBadge = getResolvedBadge(r.ConsentResolved);

            const summary = getUserName(r, String(r.Id));

            return {
                key: r.Id,
                id: r.Id,
                formId: r.FormId,
                summary,
                email: r.EmailId,
                mobile: r.MobileNo,
                ipAddress: r.IPAddress,
                created: formatDate(r.CreatedOn),
                consentText: consentBadge.text,
                consentClass: consentBadge.className,
                resolvedText: resolvedBadge.text,
                resolvedClass: resolvedBadge.className,
                raw: r,
            };
        });
    }, [consentRemoveRequests]);

    return (
        <>
            <div className="container-fluid app-shell">
                <div className="row g-0">
                    <div className="panel mb-3">
                        <div className="panel-head p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
                            <div>
                                <div className="h5 mb-1">Consent Withdraw Requests</div>
                                <div className="text-secondary small">
                                    Manage consent withdrawal and removal requests submitted by users
                                </div>
                            </div>
                        </div>

                        <div className="p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
                            <div className="input-group" style={{ maxWidth: 520 }}>
                                <span className="input-group-text search">
                                    <i className="bi bi-search" />
                                </span>
                                <input
                                    className="form-control search"
                                    placeholder="Search by email, mobile, IP, form response..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="d-flex gap-2 flex-wrap">
                                <select
                                    className="form-select search"
                                    style={{ maxWidth: 190 }}
                                    value={status}
                                    onChange={(e) => onChangeStatus(e.target.value as RequestStatusUI)}
                                >
                                    <option value="All">All</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Resolved">Resolved</option>
                                </select>

                                <select
                                    className="form-select search"
                                    style={{ maxWidth: 190 }}
                                    value={sort}
                                    onChange={(e) => onChangeSort(e.target.value as SortUI)}
                                >
                                    <option value="Newest">Newest first</option>
                                    <option value="Oldest">Oldest first</option>
                                </select>

                                <select
                                    className="form-select search"
                                    style={{ maxWidth: 140 }}
                                    value={pageSize}
                                    onChange={(e) =>
                                        refreshConsentRemoveRequests({
                                            pageNumber: 1,
                                            pageSize: Number(e.target.value),
                                        })
                                    }
                                >
                                    <option value={5}>5 / page</option>
                                    <option value={10}>10 / page</option>
                                    <option value={20}>20 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-head p-3 d-flex align-items-center justify-content-between">
                            <div className="fw-bold">All Requests</div>
                            <span className="badge badge-soft rounded-pill">
                                Total: {consentRemoveRequestsTotal}
                            </span>
                        </div>

                        <div className="p-3">
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: 230 }}>Request / User</th>
                                            <th>Email</th>
                                            <th>Mobile</th>
                                            <th>Consent</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th className="text-end" style={{ minWidth: 150 }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {(!initialized || consentRemoveRequestsLoading) && (
                                            <TableSkeletonRows rows={pageSize} />
                                        )}

                                        {initialized &&
                                            !consentRemoveRequestsLoading &&
                                            !!consentRemoveRequestsError && (
                                                <tr>
                                                    <td colSpan={7} className="text-center text-danger py-5">
                                                        {consentRemoveRequestsError}
                                                    </td>
                                                </tr>
                                            )}

                                        {initialized &&
                                            !consentRemoveRequestsLoading &&
                                            !consentRemoveRequestsError &&
                                            tableRows.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="text-center text-secondary py-5">
                                                        No consent withdrawal requests found.
                                                    </td>
                                                </tr>
                                            )}

                                        {initialized &&
                                            !consentRemoveRequestsLoading &&
                                            !consentRemoveRequestsError &&
                                            tableRows.map((row) => (
                                                <tr key={row.key}>
                                                    <td>
                                                        <div className="fw-semibold">{row.summary}</div>
                                                        <div className="text-secondary small">
                                                            Form ID: {row.formId} • IP: {safeString(row.ipAddress)}
                                                        </div>
                                                    </td>

                                                    <td className="text-secondary">{safeString(row.email)}</td>
                                                    <td className="text-secondary">{safeString(row.mobile)}</td>

                                                    <td>
                                                        <span className={row.consentClass}>{row.consentText}</span>
                                                    </td>

                                                    <td>
                                                        <span className={row.resolvedClass}>{row.resolvedText}</span>
                                                    </td>

                                                    <td className="text-secondary">{row.created}</td>

                                                    <td className="text-end">
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            type="button"
                                                            onClick={() => openActionPopup(row.raw)}
                                                            disabled={row.raw?.ConsentResolved === "Y"}
                                                        >
                                                            <i className="bi bi-check2-circle" /> Approve
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-end mt-3">
                                <nav aria-label="Consent withdraw pagination">
                                    <ul className="pagination pagination-soft mb-0">
                                        <li
                                            className={`page-item ${page <= 1 || consentRemoveRequestsLoading ? "disabled" : ""
                                                }`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => goToPage(page - 1)}
                                                type="button"
                                            >
                                                Previous
                                            </button>
                                        </li>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                                            .map((p) => (
                                                <li
                                                    key={p}
                                                    className={`page-item ${p === page ? "active" : ""}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => goToPage(p)}
                                                        type="button"
                                                        disabled={consentRemoveRequestsLoading}
                                                    >
                                                        {p}
                                                    </button>
                                                </li>
                                            ))}

                                        <li
                                            className={`page-item ${page >= totalPages || consentRemoveRequestsLoading ? "disabled" : ""
                                                }`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => goToPage(page + 1)}
                                                type="button"
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                            <div className="text-secondary small mt-2 text-end">
                                Page {page} of {totalPages} • Showing {tableRows.length} records
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {actionOpen && (
                <>
                    <div className="modal-backdrop fade show" />
                    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="fw-bold">Consent Request Action</div>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            if (actionLoading) return;
                                            setActionOpen(false);
                                        }}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className="mb-2 small text-secondary">
                                        Request ID: <span className="fw-semibold text-dark">{selectedRow?.Id}</span>
                                    </div>

                                    <div className="mb-3 small text-secondary">
                                        User: <span className="fw-semibold text-dark">
                                            {selectedRow ? getUserName(selectedRow, String(selectedRow.Id)) : "N/A"}
                                        </span>
                                    </div>

                                    <label className="form-label fw-semibold">
                                        Remark <span className="text-danger">*</span>
                                    </label>

                                    <textarea
                                        className={`form-control ${actionRemarkError ? "is-invalid" : ""}`}
                                        rows={4}
                                        placeholder="Enter action remark..."
                                        value={actionRemark}
                                        onChange={(e) => {
                                            setActionRemark(e.target.value);
                                            if (e.target.value.trim()) setActionRemarkError("");
                                        }}
                                    />

                                    {actionRemarkError && (
                                        <div className="invalid-feedback d-block">
                                            {actionRemarkError}
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => {
                                            if (actionLoading) return;
                                            setActionOpen(false);
                                        }}
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        disabled={actionLoading}
                                        onClick={() => handleAction("N")}
                                    >
                                        {actionLoading ? "Processing..." : "Reject"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        disabled={actionLoading}
                                        onClick={() => handleAction("Y")}
                                    >
                                        {actionLoading ? "Processing..." : "Accept"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <PopupAlert
                open={successOpen}
                type="success"
                title="Success"
                message={successMsg}
                onClose={() => setSuccessOpen(false)}
                autoCloseMs={2200}
            />

            <PopupAlert
                open={dangerOpen}
                type="danger"
                title="Error"
                message={dangerMsg}
                onClose={() => setDangerOpen(false)}
                autoCloseMs={2500}
            />
        </>
    );
}



// import React, { useEffect, useMemo, useState } from "react";
// import { Skeleton } from "../Components/loader";
// import { PopupAlert } from "../Components/alert";

// const baseUrl = import.meta.env.VITE_API_BASE_URL;
// const apiKey = import.meta.env.VITE_API_KEY;

// const TableSkeletonRows: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
//     return (
//         <>
//             {Array.from({ length: rows }).map((_, i) => (
//                 <tr key={`sk_${i}`}>
//                     <td><Skeleton height={16} width={60} /></td>
//                     <td>
//                         <Skeleton height={16} width="70%" />
//                         <div className="mt-2"><Skeleton height={12} width="50%" /></div>
//                     </td>
//                     <td><Skeleton height={14} width={100} /></td>
//                     <td><Skeleton height={14} width="90%" /></td>
//                     <td><Skeleton height={14} width={80} /></td>
//                     <td><Skeleton height={18} width={70} radius={50} /></td>
//                     <td className="text-end">
//                         <div className="d-inline-flex gap-2">
//                             <Skeleton height={30} width={85} radius={6} />
//                             <Skeleton height={30} width={85} radius={6} />
//                         </div>
//                     </td>
//                 </tr>
//             ))}
//         </>
//     );
// };

// export default function ConsentWithdrawRequest() {
//     const [requests, setRequests] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);

//     const [search, setSearch] = useState("");
//     const [statusFilter, setStatusFilter] = useState("Pending");

//     // Alerts
//     const [alertOpen, setAlertOpen] = useState(false);
//     const [alertMsg, setAlertMsg] = useState("");
//     const [alertType, setAlertType] = useState<"success" | "danger">("success");

//     // Action Modal
//     const [actionModalOpen, setActionModalOpen] = useState(false);
//     const [selectedRequest, setSelectedRequest] = useState<any>(null);
//     const [actionType, setActionType] = useState<"Approve" | "Reject">("Approve");
//     const [adminRemark, setAdminRemark] = useState("");
//     const [actionLoading, setActionLoading] = useState(false);

//     useEffect(() => {
//         fetchRequests();
//     }, []);

//     const fetchRequests = async () => {
//         setLoading(true);
//         try {
//             const adminCode = localStorage.getItem("ADCODE") || "";
//             // Replace with your exact Swagger GET endpoint for fetching requests if different
//             const res = await fetch(`${baseUrl}/api/Consent/GetConsentRemovalRequests`, {
//                 headers: {
//                     "X-API-KEY": apiKey || "",
//                     "X-ADMIN-CODE": adminCode,
//                 }
//             });
            
//             if (!res.ok) throw new Error("Failed to fetch requests");
//             const json = await res.json();
            
//             let data = [];
//             if (json.data) {
//                 data = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
//             } else if (Array.isArray(json)) {
//                 data = json;
//             }
//             setRequests(data);
//         } catch (err: any) {
//             console.warn("API Error, falling back to UI mock data:", err);
//             // Fallback UI data so you can test the design instantly
//             setRequests([
//                 { Id: "REQ-001", ResponseId: "SUB-881", EmailId: "johndoe@example.com", MobileNo: "9876543210", Remark: "I no longer want to receive communications.", CreatedOn: new Date().toISOString(), Status: "Pending" },
//                 { Id: "REQ-002", ResponseId: "SUB-842", EmailId: "sara@example.com", MobileNo: "1234567890", Remark: "Please remove my data per DPDP guidelines.", CreatedOn: new Date().toISOString(), Status: "Pending" },
//                 { Id: "REQ-003", ResponseId: "SUB-810", EmailId: "mike@example.com", MobileNo: "5555555555", Remark: "Data was submitted by mistake.", CreatedOn: new Date(Date.now() - 86400000).toISOString(), Status: "Approved" }
//             ]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredRequests = useMemo(() => {
//         return requests.filter((r) => {
//             const s = search.toLowerCase();
//             const matchesSearch = 
//                 (r.EmailId || r.email || "").toLowerCase().includes(s) ||
//                 (r.MobileNo || r.phone || "").toLowerCase().includes(s) ||
//                 String(r.Id || r.id || "").toLowerCase().includes(s);
            
//             const rStatus = r.Status || r.status || "Pending";
//             const matchesStatus = statusFilter === "All" || rStatus === statusFilter;
            
//             return matchesSearch && matchesStatus;
//         });
//     }, [requests, search, statusFilter]);

//     const handleOpenAction = (req: any, type: "Approve" | "Reject") => {
//         setSelectedRequest(req);
//         setActionType(type);
//         setAdminRemark("");
//         setActionModalOpen(true);
//     };

//     const submitAction = async () => {
//         if (!selectedRequest) return;
//         setActionLoading(true);
//         try {
//             const adminCode = localStorage.getItem("ADCODE") || "";
//             const statusVal = actionType === "Approve" ? "Approved" : "Rejected";
            
//             // Replace with your exact Swagger POST endpoint for taking action
//             const res = await fetch(`${baseUrl}/api/Consent/UpdateConsentRemovalStatus`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "X-API-KEY": apiKey || "",
//                     "X-ADMIN-CODE": adminCode,
//                 },
//                 body: JSON.stringify({
//                     RequestId: selectedRequest.Id || selectedRequest.id,
//                     Status: statusVal,
//                     AdminRemark: adminRemark
//                 })
//             });

//             if (!res.ok) throw new Error("Failed to update status");
            
//             setAlertMsg(`Withdrawal request successfully ${actionType.toLowerCase()}d.`);
//             setAlertType("success");
//             setAlertOpen(true);
//             setActionModalOpen(false);
//             fetchRequests(); 

//         } catch (err: any) {
//             console.warn("API failed, updating UI mock state instead", err);
//             // Update local state to see UI changes instantly
//             setRequests(prev => prev.map(r => r.Id === selectedRequest.Id ? { ...r, Status: actionType === "Approve" ? "Approved" : "Rejected" } : r));
//             setAlertMsg(`Withdrawal request successfully ${actionType.toLowerCase()}d.`);
//             setAlertType("success");
//             setAlertOpen(true);
//             setActionModalOpen(false);
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     const getStatusBadge = (status: string) => {
//         if (status === "Approved") return <span className="badge text-bg-success rounded-pill">Approved</span>;
//         if (status === "Rejected") return <span className="badge text-bg-danger rounded-pill">Rejected</span>;
//         return <span className="badge text-bg-warning rounded-pill">Pending</span>;
//     };

//     return (
//         <>
//             <div className="container-fluid app-shell">
//                 <div className="row g-0">
//                     <div className="panel mb-3">
//                         <div className="panel-head p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
//                             <div>
//                                 <div className="h5 mb-1 d-flex align-items-center gap-2">
//                                     <i className="bi bi-shield-x text-danger" /> Consent Withdrawals
//                                 </div>
//                                 <div className="text-secondary small">Review and process user requests to remove data consent</div>
//                             </div>
//                             <div className="d-flex gap-2">
//                                 <button className="btn btn-sm btn-outline-secondary" onClick={fetchRequests}>
//                                     <i className="bi bi-arrow-clockwise" /> Refresh
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Filters */}
//                         <div className="p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
//                             <div className="input-group" style={{ maxWidth: 400 }}>
//                                 <span className="input-group-text search"><i className="bi bi-search" /></span>
//                                 <input className="form-control search" placeholder="Search email, mobile, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
//                             </div>

//                             <select className="form-select search" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//                                 <option value="All">All Requests</option>
//                                 <option value="Pending">Pending Review</option>
//                                 <option value="Approved">Approved</option>
//                                 <option value="Rejected">Rejected</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Table */}
//                     <div className="panel">
//                         <div className="p-3">
//                             <div className="table-responsive">
//                                 <table className="table align-middle mb-0">
//                                     <thead>
//                                         <tr>
//                                             <th style={{ minWidth: 90 }}>Req ID</th>
//                                             <th style={{ minWidth: 200 }}>User Contact</th>
//                                             <th style={{ minWidth: 120 }}>Form Resp ID</th>
//                                             <th style={{ minWidth: 250 }}>User Remark</th>
//                                             <th style={{ minWidth: 120 }}>Date Requested</th>
//                                             <th style={{ minWidth: 100 }}>Status</th>
//                                             <th className="text-end" style={{ minWidth: 180 }}>Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {loading ? (
//                                             <TableSkeletonRows rows={5} />
//                                         ) : filteredRequests.length === 0 ? (
//                                             <tr>
//                                                 <td colSpan={7} className="text-center text-secondary py-5">
//                                                     No withdrawal requests found.
//                                                 </td>
//                                             </tr>
//                                         ) : (
//                                             filteredRequests.map((row, i) => (
//                                                 <tr key={row.Id || i}>
//                                                     <td className="fw-semibold">{row.Id}</td>
//                                                     <td>
//                                                         <div className="fw-semibold" style={{ fontSize: 13 }}>{row.EmailId || row.email}</div>
//                                                         <div className="text-secondary small">{row.MobileNo || row.phone || "No Phone"}</div>
//                                                     </td>
//                                                     <td className="text-secondary">{row.ResponseId || row.FormId || "N/A"}</td>
//                                                     <td>
//                                                         <div className="small" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 250 }} title={row.Remark || row.remark}>
//                                                             {row.Remark || row.remark || "—"}
//                                                         </div>
//                                                     </td>
//                                                     <td className="text-secondary small">
//                                                         {row.CreatedOn ? new Date(row.CreatedOn).toLocaleDateString("en-IN") : "—"}
//                                                     </td>
//                                                     <td>{getStatusBadge(row.Status || row.status)}</td>
//                                                     <td className="text-end">
//                                                         {(row.Status || row.status || "Pending") === "Pending" ? (
//                                                             <>
//                                                                 <button className="btn btn-outline-success btn-sm me-2" title="Approve Request" onClick={() => handleOpenAction(row, "Approve")}>
//                                                                     <i className="bi bi-check-lg" /> Approve
//                                                                 </button>
//                                                                 <button className="btn btn-outline-danger btn-sm" title="Reject Request" onClick={() => handleOpenAction(row, "Reject")}>
//                                                                     <i className="bi bi-x-lg" /> Reject
//                                                                 </button>
//                                                             </>
//                                                         ) : (
//                                                             <span className="text-secondary small fst-italic">Processed</span>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ACTION MODAL */}
//             {actionModalOpen && selectedRequest && (
//                 <>
//                     <div className="modal-backdrop fade show" />
//                     <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" onClick={() => setActionModalOpen(false)}>
//                         <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
//                             <div className="modal-content" style={{ background: "var(--bs-body-bg)", border: "1px solid var(--stroke)" }}>
//                                 <div className="modal-header border-bottom border-secondary">
//                                     <h5 className="modal-title fw-bold">
//                                         {actionType === "Approve" ? (
//                                             <span className="text-success"><i className="bi bi-check-circle me-2" />Approve Withdrawal</span>
//                                         ) : (
//                                             <span className="text-danger"><i className="bi bi-x-circle me-2" />Reject Withdrawal</span>
//                                         )}
//                                     </h5>
//                                     <button type="button" className="btn-close btn-close-white" onClick={() => setActionModalOpen(false)} />
//                                 </div>
                                
//                                 <div className="modal-body p-4">
//                                     <div className="mb-3 p-3" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
//                                         <div className="small text-secondary mb-1">User Reason / Remark:</div>
//                                         <div className="fw-semibold" style={{ fontSize: 14 }}>"{selectedRequest.Remark || selectedRequest.remark || "No reason provided."}"</div>
//                                     </div>

//                                     <label className="form-label fw-semibold small">Admin Note (Optional)</label>
//                                     <textarea
//                                         className="form-control"
//                                         rows={3}
//                                         placeholder={`Add a note explaining why this is being ${actionType.toLowerCase()}d...`}
//                                         value={adminRemark}
//                                         onChange={(e) => setAdminRemark(e.target.value)}
//                                     />
//                                     <div className="form-text mt-2" style={{ fontSize: 12 }}>
//                                         This action will update the compliance logs for the Data Principal.
//                                     </div>
//                                 </div>

//                                 <div className="modal-footer border-top border-secondary">
//                                     <button type="button" className="btn btn-outline-secondary btn-sm px-4" onClick={() => setActionModalOpen(false)}>
//                                         Cancel
//                                     </button>
//                                     <button 
//                                         type="button" 
//                                         className={`btn btn-${actionType === "Approve" ? "success" : "danger"} btn-sm px-4`}
//                                         onClick={submitAction}
//                                         disabled={actionLoading}
//                                     >
//                                         {actionLoading ? "Processing..." : `Confirm ${actionType}`}
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}

//             <PopupAlert
//                 open={alertOpen}
//                 type={alertType}
//                 title={alertType === "success" ? "Success" : "Error"}
//                 message={alertMsg}
//                 onClose={() => setAlertOpen(false)}
//                 autoCloseMs={2500}
//             />
//         </>
//     );
// }