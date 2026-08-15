package com.unisphere.config;

import com.unisphere.model.*;
import com.unisphere.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final CollegeRepository collegeRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RoommatePreferenceRepository roommatePreferenceRepository;
    private final ListingRepository listingRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Secure development/admin seed mechanism: always ensure admin account exists
        String adminPhone = System.getenv("ADMIN_PHONE") != null ? System.getenv("ADMIN_PHONE") : "9800000000";
        String adminEmail = System.getenv("ADMIN_EMAIL") != null ? System.getenv("ADMIN_EMAIL") : "admin@nivaro.com";
        String adminPassword = System.getenv("ADMIN_PASSWORD") != null ? System.getenv("ADMIN_PASSWORD") : "password123";

        User admin = userRepository.findByPhoneNumber(adminPhone).orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .phoneNumber(adminPhone)
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role("admin")
                    .status("VERIFIED")
                    .build();
            admin = userRepository.save(admin);

            StudentProfile adminProfile = StudentProfile.builder()
                    .user(admin)
                    .fullName("Admin Moderator")
                    .gender("MALE")
                    .majorCourse("Administrator")
                    .academicYear(1)
                    .currentSemester(1)
                    .hometownDistrict("Kathmandu")
                    .currentCity("Kathmandu")
                    .verificationStatus("VERIFIED")
                    .verificationLevel(VerificationLevel.PREMIUM_VERIFIED)
                    .build();
            studentProfileRepository.save(adminProfile);
            log.info("Admin user seeded successfully with phone: {}", adminPhone);
        } else {
            // Update admin fields to match the current environment properties
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole("admin");
            admin.setStatus("verified");
            userRepository.save(admin);
            log.info("Admin user credentials updated from environment/defaults.");
        }

        if (collegeRepository.count() > 0) {
            log.info("Database already seeded. Skipping seeder execution.");
            return;
        }

        log.info("Starting database seeding for production-ready demonstration...");

        // 1. Seed Colleges
        College pulchowk = College.builder()
                .name("IOE Pulchowk Campus")
                .city("Lalitpur")
                .address("Pulchowk, Lalitpur")
                .build();
        College kec = College.builder()
                .name("Kathmandu Engineering College")
                .city("Kathmandu")
                .address("Kalimati, Kathmandu")
                .build();
        College ncit = College.builder()
                .name("Nepal College of Information Technology")
                .city("Lalitpur")
                .address("Balkumari, Lalitpur")
                .build();
        College patan = College.builder()
                .name("Patan Multiple Campus")
                .city("Lalitpur")
                .address("Patandhoka, Lalitpur")
                .build();

        collegeRepository.saveAll(Arrays.asList(pulchowk, kec, ncit, patan));


        // 3. Seed Landlord Users
        User landlord1 = User.builder()
                .phoneNumber("9811111111")
                .email("landlord1@test.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role("owner")
                .status("VERIFIED")
                .build();
        userRepository.save(landlord1);

        StudentProfile landlord1Profile = StudentProfile.builder()
                .user(landlord1)
                .fullName("Hari Prasad")
                .gender("MALE")
                .majorCourse("Landlord")
                .academicYear(1)
                .currentSemester(1)
                .hometownDistrict("Lalitpur")
                .currentCity("Lalitpur")
                .verificationStatus("VERIFIED")
                .verificationLevel(VerificationLevel.PREMIUM_VERIFIED)
                .build();
        studentProfileRepository.save(landlord1Profile);

        // 4. Seed listings (Disabled to allow only real landlord user listings in DB)

        // 5. Seed Roommate Students (Candidates)
        // Candidate 1 (Male matching Prasanna)
        User peer1 = User.builder()
                .phoneNumber("9822222222")
                .email("suman@college.edu")
                .passwordHash(passwordEncoder.encode("password123"))
                .role("student")
                .status("VERIFIED")
                .build();
        userRepository.save(peer1);

        StudentProfile peer1Profile = StudentProfile.builder()
                .user(peer1)
                .fullName("Suman Thapa")
                .gender("MALE")
                .age(21)
                .college(pulchowk)
                .majorCourse("Computer Engineering")
                .academicYear(3)
                .currentSemester(5)
                .avatarUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200")
                .bio("I love gaming, football, and coding in Java. Looking for a clean roommate who is quiet during exam weeks.")
                .hometownDistrict("Pokhara")
                .currentCity("Lalitpur")
                .verificationStatus("VERIFIED")
                .verificationLevel(VerificationLevel.STUDENT_VERIFIED)
                .trustScore(80)
                .interests(Arrays.asList("Coding", "Football", "Gaming"))
                .skills(Arrays.asList("Java", "UI Design"))
                .languages(Arrays.asList("Nepali", "English"))
                .build();
        studentProfileRepository.save(peer1Profile);

        // Candidate 1 roommate preferences
        RoommatePreference peer1Pref = RoommatePreference.builder()
                .user(peer1)
                .smoking(0) // Non-smoking
                .drinking(1) // Rare
                .sleepSchedule(0) // Early bird
                .cleanliness(5) // Very clean
                .budgetMin(new BigDecimal("5000.0"))
                .budgetMax(new BigDecimal("10000.0"))
                .studyHabits(4)
                .foodPreference(0) // Veg
                .socialLevel(3)
                .noiseTolerance(2)
                .build();
        roommatePreferenceRepository.save(peer1Pref);

        // Candidate 2 (Female candidate)
        User peer2 = User.builder()
                .phoneNumber("9833333333")
                .email("prerna@college.edu")
                .passwordHash(passwordEncoder.encode("password123"))
                .role("student")
                .status("PENDING_VERIFICATION")
                .build();
        userRepository.save(peer2);

        StudentProfile peer2Profile = StudentProfile.builder()
                .user(peer2)
                .fullName("Prerna Adhikari")
                .gender("FEMALE")
                .age(20)
                .college(patan)
                .majorCourse("BSc CSIT")
                .academicYear(2)
                .currentSemester(3)
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200")
                .bio("Focused student, early bird, and veg food lover. Quiet, study-first roommate preferred.")
                .hometownDistrict("Chitwan")
                .currentCity("Lalitpur")
                .verificationStatus("PENDING_VERIFICATION")
                .verificationLevel(VerificationLevel.PHONE_VERIFIED)
                .trustScore(30)
                .interests(Arrays.asList("Reading", "Music", "Photography"))
                .skills(Arrays.asList("Python", "Writing"))
                .languages(Arrays.asList("Nepali", "English", "Newari"))
                .build();
        studentProfileRepository.save(peer2Profile);

        RoommatePreference peer2Pref = RoommatePreference.builder()
                .user(peer2)
                .smoking(0)
                .drinking(0)
                .sleepSchedule(0)
                .cleanliness(5)
                .budgetMin(new BigDecimal("6000.0"))
                .budgetMax(new BigDecimal("9000.0"))
                .studyHabits(5)
                .foodPreference(0)
                .socialLevel(2)
                .noiseTolerance(1)
                .build();
        roommatePreferenceRepository.save(peer2Pref);

        // Seed some notification system logs
        Notification alert = Notification.builder()
                .userId(peer1.getId())
                .title("Welcome to Nivaro!")
                .content("Start exploring rooms and roommate compatibility matches nearby.")
                .isRead(false)
                .build();
        notificationRepository.save(alert);

        log.info("Database seeding successfully completed.");
    }
}
