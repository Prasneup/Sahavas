package com.unisphere.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(Optional<JavaMailSender> mailSender) {
        this.mailSender = mailSender.orElse(null);
    }

    public void sendVerificationStatusEmail(String toEmail, String fullName, String action, String reason) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Cannot send email: recipient address is empty");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@nivaro.com");
            message.setTo(toEmail);
            
            String subject = "Nivaro Account Status Update - " + action;
            StringBuilder body = new StringBuilder();
            body.append("Namaste ").append(fullName).append(",\n\n");
            body.append("Your Nivaro account verification status has been updated to: ").append(action).append(".\n\n");
            
            if (reason != null && !reason.isBlank()) {
                body.append("Comments/Reason from administrator:\n");
                body.append("\"").append(reason).append("\"\n\n");
            }
            
            body.append("If you need to make corrections, please log in to your dashboard at http://localhost:3000 to submit updated documents.\n\n");
            body.append("Dhanyabaad,\nThe Nivaro Vetting Team");

            message.setSubject(subject);
            message.setText(body.toString());

            log.info("Attempting to send email to {} with status: {}", toEmail, action);
            if (mailSender != null) {
                mailSender.send(message);
                log.info("Email sent successfully to {}", toEmail);
            } else {
                log.warn("JavaMailSender is not configured. Skipping active SMTP dispatch.");
            }
        } catch (Exception e) {
            log.error("Failed to deliver email to {} due to mail sender error: {}", toEmail, e.getMessage());
            log.warn("Gracefully continuing execution despite email failure (to allow testing without SMTP servers)");
        }
    }
}
