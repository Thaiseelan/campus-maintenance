package com.bit.maintenance.service;

import com.bit.maintenance.model.Complaint;
import com.bit.maintenance.model.Notification;
import com.bit.maintenance.model.Technician;
import com.bit.maintenance.model.User;
import com.bit.maintenance.model.enums.NotificationType;
import com.bit.maintenance.repository.NotificationRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

// Every event both sends an email AND writes a Notification row - so even if
// SMTP isn't configured yet (common while developing locally), you still get
// a record of what should have gone out, with emailSent=false to show it
// didn't. A broken mail server should never block the complaint workflow.
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;

    public void notifyComplaintSubmitted(Complaint complaint) {
        String subject = "Complaint registered - CMP-" + complaint.getId();
        String body = "<p>Your maintenance complaint has been successfully registered.</p>"
                + "<p><b>Complaint ID:</b> CMP-" + complaint.getId() + "<br>"
                + "<b>Status:</b> OPEN</p>";
        send(complaint.getReportedBy(), complaint, NotificationType.COMPLAINT_SUBMITTED, subject, body);
    }

    public void notifyTechnicianAssigned(Complaint complaint, Technician technician) {
        String subject = "Technician assigned - CMP-" + complaint.getId();
        String body = "<p>A technician has been assigned to your complaint.</p>"
                + "<p><b>Complaint ID:</b> CMP-" + complaint.getId() + "<br>"
                + "<b>Technician:</b> " + technician.getUser().getName() + "<br>"
                + "<b>Status:</b> ASSIGNED</p>";
        send(complaint.getReportedBy(), complaint, NotificationType.TECHNICIAN_ASSIGNED, subject, body);
    }

    public void notifyWorkStarted(Complaint complaint) {
        String subject = "Work started - CMP-" + complaint.getId();
        String body = "<p>Your maintenance complaint is currently being processed.</p>"
                + "<p><b>Status:</b> IN_PROGRESS</p>";
        send(complaint.getReportedBy(), complaint, NotificationType.WORK_STARTED, subject, body);
    }

    public void notifyIssueResolved(Complaint complaint) {
        String subject = "Issue resolved - CMP-" + complaint.getId();
        String body = "<p>Your maintenance complaint has been resolved.</p>"
                + "<p><b>Complaint ID:</b> CMP-" + complaint.getId() + "<br>"
                + "<b>Status:</b> RESOLVED</p>"
                + "<p>Please confirm and close it from your dashboard once you're satisfied with the fix.</p>";
        send(complaint.getReportedBy(), complaint, NotificationType.ISSUE_RESOLVED, subject, body);
    }

    public void notifyComplaintClosed(Complaint complaint) {
        String subject = "Complaint closed - CMP-" + complaint.getId();
        String body = "<p>Your maintenance complaint has been closed.</p>"
                + "<p><b>Complaint ID:</b> CMP-" + complaint.getId() + "</p>";
        send(complaint.getReportedBy(), complaint, NotificationType.COMPLAINT_CLOSED, subject, body);
    }

    private void send(User recipient, Complaint complaint, NotificationType type, String subject, String htmlBody) {
        Notification notification = Notification.builder()
                .user(recipient)
                .complaint(complaint)
                .message(subject)
                .notificationType(type)
                .emailSent(false)
                .build();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(recipient.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            notification.setEmailSent(true);
        } catch (Exception e) {
            log.warn("Failed to send '{}' email to {}: {}", type, recipient.getEmail(), e.getMessage());
        }

        notificationRepository.save(notification);
    }
}
