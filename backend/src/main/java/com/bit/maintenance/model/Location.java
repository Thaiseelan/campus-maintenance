package com.bit.maintenance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Structured Building -> Floor -> Room picker (Option A from the project doc).
    // Values are constrained to a fixed campus list at the API/DTO level so a
    // user can never enter an off-campus location.
    @Column(nullable = false)
    private String building;

    private String floor;

    private String room;

    // Reserved for a possible future map-based upgrade; not used by the MVP.
    private Double latitude;
    private Double longitude;
}
