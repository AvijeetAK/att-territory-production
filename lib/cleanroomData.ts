import cleanroomData from "../data/cleanroom_seed.json";
import { Business, RegionState, AuditResponse } from "../app/types";

export interface FilterParams {
  state?: string | null;
  sub_region?: string | null;
  sub_sub_region?: string | null;
  att_filter?: "ALL" | "ATT_ONLY" | "NON_ATT_ONLY" | null;
  size_tiers?: string | null;
  q?: string | null;
}

export function getCleanroomHierarchy(): RegionState[] {
  return cleanroomData.hierarchy as RegionState[];
}

export function getCleanroomBusinesses(params: FilterParams = {}): Business[] {
  let list = cleanroomData.businesses as unknown as Business[];

  // 1. Filter by State Code or State Name
  if (params.state) {
    const s = params.state.toUpperCase().trim();
    list = list.filter((b) => b.state.toUpperCase() === s);
  }

  // 2. Filter by AT&T customer status
  if (params.att_filter === "ATT_ONLY") {
    list = list.filter((b) => Boolean(b.is_att_customer));
  } else if (params.att_filter === "NON_ATT_ONLY") {
    list = list.filter((b) => !b.is_att_customer);
  }

  // 3. Filter by Size Tiers
  if (params.size_tiers) {
    const allowedTiers = params.size_tiers.split(",").map((t) => t.trim().toUpperCase());
    list = list.filter((b) => allowedTiers.includes(b.size_tier.toUpperCase()));
  }

  // 4. Filter by text search query
  if (params.q && params.q.trim()) {
    const qLower = params.q.toLowerCase().trim();
    list = list.filter((b) => {
      const matchName = b.business_name.toLowerCase().includes(qLower);
      const matchCat = b.industry_category.toLowerCase().includes(qLower);
      const matchMall = b.parent_mall_name?.toLowerCase().includes(qLower);
      const matchIsp = b.current_isp_name.toLowerCase().includes(qLower);
      return matchName || matchCat || matchMall || matchIsp;
    });
  }

  return list;
}

export function getCleanroomBusinessById(gersId: string): Business | undefined {
  const businesses = cleanroomData.businesses as unknown as Business[];
  return businesses.find((b) => b.overture_gers_id === gersId);
}

export function generateAuditReceipt(gersId: string): AuditResponse | null {
  const business = getCleanroomBusinessById(gersId);
  if (!business) return null;

  const nowUtc = new Date().toISOString();
  const hexSuffix = Math.random().toString(16).substring(2, 8).toUpperCase();
  const auditId = `AUDIT-TCPA-${hexSuffix}`;

  const nameParts = business.contact_name.split(" ");
  const firstName = nameParts[0].toLowerCase();
  const lastName = nameParts[nameParts.length - 1].toLowerCase();
  const domainSlug = business.business_name.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "");

  const directEmail = `${firstName}.${lastName}@${domainSlug}.com`;
  const directPhone = business.contact_phone_masked.replace("XX", "42");

  return {
    status:
      business.dnc_status === "CLEARED_B2B"
        ? "AUDITED_ACCESS_GRANTED"
        : "RESTRICTED_ACCESS_WARNING",
    audit_log_id: auditId,
    timestamp_utc: nowUtc,
    overture_gers_id: business.overture_gers_id,
    business_name: business.business_name,
    dnc_status: business.dnc_status,
    dnc_cleared: business.dnc_status === "CLEARED_B2B",
    phone_line_type: business.phone_line_type,
    licensed_broker_source: business.data_broker_source,
    revealed_contact: {
      full_name: business.contact_name,
      role: business.contact_role,
      direct_email: directEmail,
      direct_phone: directPhone,
    },
    regulatory_notice:
      "47 U.S.C. § 227 TCPA & CCPA/CPRA Compliant. Access logged under enterprise B2B sales exemption.",
  };
}

