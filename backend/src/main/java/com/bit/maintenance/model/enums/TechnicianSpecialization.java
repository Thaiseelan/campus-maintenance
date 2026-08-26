package com.bit.maintenance.model.enums;

// Maps roughly 1:1 with ComplaintCategory - see AssignmentService (Phase 5)
// for how a complaint's category is matched to a specialization.
public enum TechnicianSpecialization {
    ELECTRICAL,
    PLUMBING,
    NETWORK,
    CARPENTRY_FURNITURE,
    HOUSEKEEPING,
    CIVIL_MAINTENANCE,
    GENERAL
}
