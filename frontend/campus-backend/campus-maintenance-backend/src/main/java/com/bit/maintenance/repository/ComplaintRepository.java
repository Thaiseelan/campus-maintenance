package com.bit.maintenance.repository;

import com.bit.maintenance.model.Complaint;
import com.bit.maintenance.model.User;
import com.bit.maintenance.model.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByReportedBy(User user);
    List<Complaint> findByStatus(ComplaintStatus status);
    long countByStatus(ComplaintStatus status);
    long countByCategory(com.bit.maintenance.model.enums.ComplaintCategory category);
}
