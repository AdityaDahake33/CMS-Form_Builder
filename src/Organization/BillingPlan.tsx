import React from "react";

type BillingStatus = "Paid" | "Trial" | "Overdue";
type BillingAction = "Invoice" | "Send Reminder" | "Suspend";

interface BillingRow {
  name: string;
  plan: string;
  price: string;
  nextBilling: string;
  status: BillingStatus;
  action: BillingAction;
}

interface PricingPlan {
  name: "Silver" | "Gold" | "Diamond" | "Platinum";
  price: string;
  subtext: string;
  features: string[];
  bestValue?: boolean;
}

const BILLING_ROWS: BillingRow[] = [
  {
    name: "FinServ Corp Ltd.",
    plan: "Enterprise",
    price: "₹80,000/mo",
    nextBilling: "01 Mar 2025",
    status: "Paid",
    action: "Invoice",
  },
  {
    name: "TechnoEdge Pvt. Ltd.",
    plan: "Enterprise",
    price: "₹80,000/mo",
    nextBilling: "01 Mar 2025",
    status: "Paid",
    action: "Invoice",
  },
  {
    name: "EduLearn Academy",
    plan: "Pro",
    price: "₹30,000/mo",
    nextBilling: "01 Mar 2025",
    status: "Paid",
    action: "Invoice",
  },
  {
    name: "HealthPlus Hospital",
    plan: "Pro",
    price: "₹30,000/mo",
    nextBilling: "28 Feb 2025",
    status: "Trial",
    action: "Send Reminder",
  },
  {
    name: "GlobalRetail Inc.",
    plan: "Basic",
    price: "₹10,000/mo",
    nextBilling: "Overdue",
    status: "Overdue",
    action: "Suspend",
  },
];

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Silver",
    price: "₹9,999",
    subtext: "per month, billed monthly",
    features: ["1 workspace", "Basic forms", "Email support", "Audit logs (7 days)"],
  },
  {
    name: "Gold",
    price: "₹19,999",
    subtext: "per month, billed monthly",
    features: ["3 workspaces", "DPDP-ready templates", "Role-based access", "Audit logs (30 days)"],
  },
  {
    name: "Diamond",
    price: "₹29,999",
    subtext: "per month, billed monthly",
    features: ["Unlimited workspaces", "Advanced validations", "SSO-ready", "Audit logs (90 days)"],
    bestValue: true,
  },
  {
    name: "Platinum",
    price: "₹79,999",
    subtext: "per month, billed monthly",
    features: ["Enterprise SLA", "Dedicated support", "Custom integrations", "Unlimited audit logs"],
  },
];

function tierAccent(name: PricingPlan["name"]) {
  switch (name) {
    case "Silver":
      return { title: "#cbd5e1", badgeBorder: "rgba(203, 213, 225, 0.35)" };
    case "Gold":
      return { title: "#fbbf24", badgeBorder: "rgba(251, 191, 36, 0.35)" };
    case "Diamond":
      return { title: "#22d3ee", badgeBorder: "rgba(34, 211, 238, 0.35)" };
    case "Platinum":
      return { title: "#a78bfa", badgeBorder: "rgba(167, 139, 250, 0.35)" };
  }
}

function statusClass(status: BillingStatus) {
  switch (status) {
    case "Paid":
      return "badge rounded-pill text-bg-success";
    case "Trial":
      return "badge rounded-pill text-bg-warning";
    case "Overdue":
      return "badge rounded-pill text-bg-danger";
    default:
      return "badge rounded-pill text-bg-secondary";
  }
}

function ActionButton({ action }: { action: BillingAction }) {
  if (action === "Invoice") {
    return (
      <button type="button" className="btn btn-outline-secondary btn-sm">
        Invoice
      </button>
    );
  }

  if (action === "Send Reminder") {
    return (
      <button type="button" className="btn btn-success btn-sm">
        Send Reminder
      </button>
    );
  }

  return (
    <button type="button" className="btn btn-danger btn-sm">
      Suspend
    </button>
  );
}

function PricingCard({
  plan,
  hovered,
  onHover,
}: {
  plan: PricingPlan;
  hovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const accent = tierAccent(plan.name);

  const hoverStyle = hovered
    ? ({
        borderColor: accent.badgeBorder,
        boxShadow: "0 18px 54px rgba(0, 0, 0, 0.35)",
        transform: "scale(1.01)",
      } as const)
    : undefined;

  return (
    <div
      className="stat-card h-100"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={hoverStyle}
    >
      <div className="p-4 h-100 d-flex flex-column">
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div>
            <div className="fw-bold mb-1" style={{ fontSize: 18, color: accent.title }}>
              {plan.name}
            </div>
            <div className={`small ${hovered ? "text-secondary" : "text-secondary"}`}>{plan.subtext}</div>
          </div>

          {plan.bestValue && (
            <span
              className="badge rounded-pill fw-semibold px-3 py-2"
              style={{
                border: `1px solid ${accent.badgeBorder}`,
                background: "rgba(255,255,255,0.04)",
                color: "var(--text-2)",
              }}
            >
              <i className="bi bi-star-fill me-1" />
              Best Value
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-3">
          <div
            className="fw-bold"
            style={{
              fontSize: 28,
              letterSpacing: "-0.03em",
              color: accent.title,
            }}
          >
            {plan.price}
            <span className={`small ms-1 ${hovered ? "text-secondary" : "text-secondary"}`}>/mo</span>
          </div>
          <div className={`small ${hovered ? "text-secondary" : "text-secondary"}`}>Billed monthly • Cancel anytime</div>
        </div>

        {/* CTA (like reference: centered, outlined except best value) */}
        <div className="mt-3">
          <button
            type="button"
            className="btn btn-brand w-100"
          >
            Buy Now
          </button>
        </div>

        {/* Features */}
        <div className="mt-4 d-flex flex-column gap-2 flex-grow-1">
          {plan.features.map((f) => (
            <div key={f} className="d-flex align-items-start gap-2">
              <i className="bi bi-check2" style={{ marginTop: 2, color: "var(--text-2)" }} />
              <div className={`small ${hovered ? "" : "text-secondary"}`} style={{ lineHeight: 1.35 }}>
                {f}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingTable({ rows }: { rows: BillingRow[] }) {
  return (
    <div className="form-card card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div>
          <div className="fw-bold">Billing</div>
          <div className="text-secondary small">Organizations, plans, and payment status</div>
        </div>
        <span className="help-chip">
          <i className="bi bi-receipt" /> Invoices
        </span>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Plan</th>
                <th>Monthly Fee</th>
                <th>Next Billing</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.name}-${r.plan}`}>
                  <td className="fw-semibold">{r.name}</td>
                  <td>{r.plan}</td>
                  <td>{r.price}</td>
                  <td>{r.nextBilling}</td>
                  <td>
                    <span className={statusClass(r.status)}>{r.status}</span>
                  </td>
                  <td className="text-end">
                    <ActionButton action={r.action} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const BillingPlan: React.FC = () => {
  const [hoveredTier, setHoveredTier] = React.useState<PricingPlan["name"] | null>(null);

  return (
    <div className="container-fluid app-shell">
      <div className="row g-0">
        <div className="panel mb-3">
          <div className="panel-head p-3">
            <div className="h4 mb-1">Billing & Plans</div>
            <div className="text-secondary small">
              Organization ➜ Subscription ➜ Billing
            </div>
          </div>
        </div>

        <div className="panel mb-3">
          <div className="panel-head d-flex align-items-center justify-content-between p-3 flex-wrap gap-2">
            <div>
              <div className="fw-bold">Pricing</div>
              <div className="text-secondary small">Pick a plan for your organization</div>
            </div>
            <span className="help-chip">
              <i className="bi bi-lightning-charge" /> Best value: Deluxe
            </span>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {PRICING_PLANS.map((p) => (
                <div key={p.name} className="col-12 col-md-6 col-xl-6 col-xxl-3">
                  <PricingCard
                    plan={p}
                    hovered={hoveredTier === p.name}
                    onHover={(v) => setHoveredTier(v ? p.name : null)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <BillingTable rows={BILLING_ROWS} />
        </div>
      </div>
    </div>
  );
};

export default BillingPlan; 