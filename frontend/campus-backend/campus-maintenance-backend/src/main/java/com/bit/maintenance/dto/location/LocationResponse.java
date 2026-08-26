package com.bit.maintenance.dto.location;

import com.bit.maintenance.model.Location;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LocationResponse {
    private Long id;
    private String building;
    private String floor;
    private String room;

    public static LocationResponse from(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getBuilding(),
                location.getFloor(),
                location.getRoom()
        );
    }
}
