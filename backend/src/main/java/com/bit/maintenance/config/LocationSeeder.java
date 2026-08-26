package com.bit.maintenance.config;

import com.bit.maintenance.model.Location;
import com.bit.maintenance.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

// Placeholder campus locations so the Building -> Floor -> Room picker has
// real options right away. Swap these for BIT's actual building/room list
// (or build a small admin "manage locations" screen) before the real demo -
// these names are examples, not the confirmed campus layout.
@Component
@RequiredArgsConstructor
public class LocationSeeder implements CommandLineRunner {

    private final LocationRepository locationRepository;

    @Override
    public void run(String... args) {
        if (locationRepository.count() > 0) {
            return;
        }

        List<Location> seedLocations = List.of(
                loc("CSE Block", "Ground Floor", "C001"),
                loc("CSE Block", "Ground Floor", "C002"),
                loc("CSE Block", "1st Floor", "C101"),
                loc("CSE Block", "2nd Floor", "C204"),
                loc("EEE Block", "Ground Floor", "E001"),
                loc("EEE Block", "1st Floor", "E102"),
                loc("Mechanical Block", "Ground Floor", "M001"),
                loc("Civil Block", "1st Floor", "V101"),
                loc("Main Library", "Ground Floor", "Reading Hall"),
                loc("Main Library", "1st Floor", "Reference Section"),
                loc("Admin Block", "Ground Floor", "Reception"),
                loc("Hostel Block A", "Ground Floor", "Common Room"),
                loc("Hostel Block A", "1st Floor", "A101"),
                loc("Hostel Block B", "Ground Floor", "B001"),
                loc("Canteen", "Ground Floor", "Main Hall"),
                loc("Sports Complex", "Ground Floor", "Indoor Court")
        );

        locationRepository.saveAll(seedLocations);
    }

    private Location loc(String building, String floor, String room) {
        return Location.builder()
                .building(building)
                .floor(floor)
                .room(room)
                .build();
    }
}
