export interface SubSubRegion {
  id: number;
  name: string;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
  is_mall: boolean;
}

export interface SubRegion {
  sub_region_name: string;
  sub_sub_regions: SubSubRegion[];
}

export interface RegionState {
  state_name: string;
  state_code: string;
  sub_regions: SubRegion[];
}

export interface RecommendedPlan {
  id: string;
  name: string;
  speed_download_mbps: number;
  speed_upload_mbps: number;
  is_symmetric: boolean;
  monthly_rate_usd: number;
  ideal_for: string;
  target_size_tier: string;
  service_type: string;
  sla: string;
  features: string[];
}

export interface ComplianceMetadata {
  data_license: string;
  telecom_metrics: string;
  pii_privacy: string;
  fcc_broadband_source: string;
  costquest_bsl_fabric_free: boolean;
  google_maps_cached_fields: boolean;
}

export interface Business {
  overture_gers_id: string;
  license_source: string;
  business_name: string;
  naics_code: string;
  industry_category: string;
  parent_mall_name: string | null;
  floor_unit: string | null;
  address_street: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  h3_res8_hex: string;
  employee_count: number;
  sqft_estimate: number;
  size_tier: "MICRO" | "SMALL" | "MEDIUM" | "LARGE";
  detected_asn: string;
  current_isp_name: string;
  is_att_customer: number | boolean;
  fcc_fiber_hex_available: number | boolean;
  modeled_bandwidth_mbps: number;
  modeled_monthly_tb: number;
  recommended_att_plan_id: string;
  conversion_score_pct: number;
  contact_name: string;
  contact_role: string;
  contact_email_masked: string;
  contact_phone_masked: string;
  phone_line_type: "LANDLINE" | "WIRELESS";
  dnc_status: "CLEARED_B2B" | "RESTRICTED";
  data_broker_source: string;
  recommended_att_plan: RecommendedPlan;
  pin_color_hex: string;
  compliance_metadata: ComplianceMetadata;
}

export interface AuditResponse {
  status: string;
  audit_log_id: string;
  timestamp_utc: string;
  overture_gers_id: string;
  business_name: string;
  dnc_status: string;
  dnc_cleared: boolean;
  phone_line_type: string;
  licensed_broker_source: string;
  revealed_contact: {
    full_name: string;
    role: string;
    direct_email: string;
    direct_phone: string;
  };
  regulatory_notice: string;
}

