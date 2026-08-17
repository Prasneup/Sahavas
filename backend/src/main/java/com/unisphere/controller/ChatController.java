package com.unisphere.controller;

import com.unisphere.dto.ChatPayload;
import com.unisphere.dto.ProfileResponse;
import com.unisphere.model.Conversation;
import com.unisphere.model.Message;
import com.unisphere.model.StudentProfile;
import com.unisphere.model.User;
import com.unisphere.model.Listing;
import com.unisphere.model.Notification;
import com.unisphere.repository.ConversationRepository;
import com.unisphere.repository.MessageRepository;
import com.unisphere.repository.StudentProfileRepository;
import com.unisphere.repository.UserRepository;
import com.unisphere.repository.ListingRepository;
import com.unisphere.repository.NotificationRepository;
import com.unisphere.security.UserPrincipal;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ListingRepository listingRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Direct Conversation List DTO
    @Data
    @Builder
    public static class ListingDto {
        private UUID id;
        private String title;
        private java.math.BigDecimal rentAmount;
        private String distanceFromCollegeText;
    }

    @Data
    @Builder
    public static class ConversationResponse {
        private UUID conversationId;
        private ProfileResponse peerProfile;
        private String lastMessage;
        private String lastMessageTime;
        private long unreadCount;
        private ListingDto listing;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getId();
        List<Conversation> conversations = conversationRepository.findAllByParticipantId(userId);

        List<ConversationResponse> responseList = conversations.stream().map(c -> {
            // Find peer user
            User peer = c.getParticipants().stream()
                    .filter(p -> !p.getId().equals(userId))
                    .findFirst()
                    .orElse(null);

            ProfileResponse peerProfile = null;
            if (peer != null) {
                StudentProfile studentProfile = studentProfileRepository.findById(peer.getId()).orElse(null);
                if (studentProfile != null) {
                    peerProfile = mapProfile(studentProfile);
                } else {
                    // Fallback profile response for landlords/non-student users
                    peerProfile = ProfileResponse.builder()
                            .id(peer.getId())
                            .fullName("Landlord")
                            .role(peer.getRole())
                            .collegeName("Nivaro User")
                            .avatarUrl("")
                            .completenessPercentage(100)
                            .build();
                }
            }

            // Get messages
            List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
            String lastMsg = "";
            String lastMsgTime = "";
            if (!msgs.isEmpty()) {
                Message last = msgs.get(msgs.size() - 1);
                lastMsg = last.getContent();
                lastMsgTime = last.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            }

            long unread = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(c.getId(), userId);

            ListingDto listingDto = null;
            if (c.getListing() != null) {
                listingDto = ListingDto.builder()
                        .id(c.getListing().getId())
                        .title(c.getListing().getTitle())
                        .rentAmount(c.getListing().getRentAmount())
                        .distanceFromCollegeText(c.getListing().getDistanceFromCollegeText())
                        .build();
            }

            return ConversationResponse.builder()
                    .conversationId(c.getId())
                    .peerProfile(peerProfile)
                    .lastMessage(lastMsg)
                    .lastMessageTime(lastMsgTime)
                    .unreadCount(unread)
                    .listing(listingDto)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<?> getMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID conversationId) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        UUID userId = principal.getId();
        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(userId));

        if (!isParticipant) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You are not a participant in this conversation"));
        }

        List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        
        // Mark all incoming messages as read
        msgs.stream()
            .filter(m -> !m.getSenderId().equals(userId) && !m.isRead())
            .forEach(m -> {
                m.setRead(true);
                messageRepository.save(m);
            });

        return ResponseEntity.ok(msgs);
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<?> postMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID conversationId,
            @RequestBody Map<String, String> body) {

        UUID senderId = principal.getId();
        String content = body.get("content");

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(senderId));

        if (!isParticipant) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You are not a participant in this conversation"));
        }

        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .content(content)
                .messageType(Message.MessageType.TEXT)
                .build();

        Message saved = messageRepository.save(message);
        conversationRepository.save(conversation);

        // Save Notification to peer participant
        try {
            User peer = conversation.getParticipants().stream()
                    .filter(p -> !p.getId().equals(senderId))
                    .findFirst()
                    .orElse(null);
            if (peer != null) {
                StudentProfile senderProf = studentProfileRepository.findById(senderId).orElse(null);
                String senderName = senderProf != null ? senderProf.getFullName() : "User";
                String type = "NEW_MESSAGE";
                String title = "New message from " + senderName;
                String preview = content.length() > 65 ? content.substring(0, 62) + "..." : content;
                UUID roomId = conversation.getListing() != null ? conversation.getListing().getId() : null;
                createNotification(peer.getId(), type, title, preview, conversationId, roomId);
            }
        } catch (Exception e) {
            System.err.println("Failed to trigger message notification: " + e.getMessage());
        }

        try {
            User peer = conversation.getParticipants().stream()
                    .filter(p -> !p.getId().equals(senderId))
                    .findFirst()
                    .orElse(null);
            if (peer != null) {
                ChatPayload payload = ChatPayload.builder()
                        .id(saved.getId())
                        .conversationId(conversationId)
                        .senderId(senderId)
                        .recipientId(peer.getId())
                        .content(content)
                        .messageType("TEXT")
                        .createdAt(saved.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME))
                        .build();
                messagingTemplate.convertAndSendToUser(
                        peer.getId().toString(),
                        "/queue/messages",
                        payload
                );
            }
        } catch (Exception e) {
            // Socket fallback logs
        }

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/conversations")
    public ResponseEntity<Map<String, Object>> createConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {

        UUID actorId = principal.getId();
        UUID recipientId = UUID.fromString(body.get("recipientUserId"));
        String listingIdStr = body.get("listingId");
        UUID listingId = (listingIdStr != null && !listingIdStr.trim().isEmpty()) ? UUID.fromString(listingIdStr) : null;

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        Conversation conversation;
        if (listingId != null) {
            List<Conversation> existing = conversationRepository.findConversationBetweenUsersAndListing(actorId, recipientId, listingId);
            if (!existing.isEmpty()) {
                conversation = existing.get(0);
            } else {
                // Check if a general conversation exists to upgrade it
                List<Conversation> general = conversationRepository.findConversationBetweenUsersAndListingIsNull(actorId, recipientId);
                Listing listing = listingRepository.findById(listingId)
                        .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
                if (!general.isEmpty()) {
                    conversation = general.get(0);
                    conversation.setListing(listing);
                    conversationRepository.save(conversation);
                } else {
                    conversation = Conversation.builder()
                            .participants(Arrays.asList(actor, recipient))
                            .listing(listing)
                            .build();
                    conversationRepository.save(conversation);
                }

                // Add "NEW_ENQUIRY" Notification to the recipient (the landlord)
                try {
                    String type = "NEW_ENQUIRY";
                    String title = "New student enquiry";
                    StudentProfile actorProf = studentProfileRepository.findById(actorId).orElse(null);
                    String actorName = actorProf != null ? actorProf.getFullName() : "Student";
                    String content = actorName + " has inquired about your room: " + listing.getTitle();
                    createNotification(recipientId, type, title, content, conversation.getId(), listingId);
                } catch (Exception e) {
                    System.err.println("Failed to trigger enquiry notification: " + e.getMessage());
                }
            }
        } else {
            List<Conversation> existing = conversationRepository.findConversationBetweenUsersAndListingIsNull(actorId, recipientId);
            if (!existing.isEmpty()) {
                conversation = existing.get(0);
            } else {
                // Reuse existing listing conversation if one exists
                List<Conversation> allConvs = conversationRepository.findAllByParticipantId(actorId);
                Optional<Conversation> anyWithPeer = allConvs.stream()
                        .filter(c -> c.getParticipants().stream().anyMatch(p -> p.getId().equals(recipientId)))
                        .findFirst();
                if (anyWithPeer.isPresent()) {
                    conversation = anyWithPeer.get();
                } else {
                    conversation = Conversation.builder()
                            .participants(Arrays.asList(actor, recipient))
                            .build();
                    conversationRepository.save(conversation);
                }
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("conversationId", conversation.getId());
        return ResponseEntity.ok(res);
    }

    private void createNotification(UUID recipientId, String type, String title, String content, UUID conversationId, UUID roomId) {
        try {
            Notification notification = Notification.builder()
                    .userId(recipientId)
                    .type(type)
                    .title(title)
                    .content(content)
                    .conversationId(conversationId)
                    .roomId(roomId)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error saving notification: " + e.getMessage());
        }
    }

    // --- WebSocket Message Mapping triggers ---

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatPayload payload) {
        // Save message to database
        Message message = Message.builder()
                .conversationId(payload.getConversationId())
                .senderId(payload.getSenderId())
                .content(payload.getContent())
                .messageType(Message.MessageType.valueOf(payload.getMessageType().toUpperCase()))
                .sharedResourceId(payload.getSharedResourceId())
                .build();
        
        messageRepository.save(message);

        // Update conversation timestamp
        Conversation c = conversationRepository.findById(payload.getConversationId()).orElse(null);
        if (c != null) {
            conversationRepository.save(c);
        }

        // Save Notification to peer participant
        try {
            StudentProfile senderProf = studentProfileRepository.findById(payload.getSenderId()).orElse(null);
            String senderName = senderProf != null ? senderProf.getFullName() : "User";
            String type = "NEW_MESSAGE";
            String title = "New message from " + senderName;
            String preview = payload.getContent().length() > 65 ? payload.getContent().substring(0, 62) + "..." : payload.getContent();
            UUID roomId = c != null && c.getListing() != null ? c.getListing().getId() : null;
            createNotification(payload.getRecipientId(), type, title, preview, payload.getConversationId(), roomId);
        } catch (Exception e) {
            System.err.println("Failed to trigger message notification (socket): " + e.getMessage());
        }

        payload.setId(message.getId());
        payload.setCreatedAt(message.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));

        // Dispatch user-specific socket frame
        messagingTemplate.convertAndSendToUser(
                payload.getRecipientId().toString(),
                "/queue/messages",
                payload
        );
    }

    @MessageMapping("/chat.typing")
    public void sendTyping(ChatPayload payload) {
        // Broadcast typing indicator to peer queue
        messagingTemplate.convertAndSendToUser(
                payload.getRecipientId().toString(),
                "/queue/typing",
                payload
        );
    }

    private ProfileResponse mapProfile(StudentProfile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .role(profile.getUser() != null ? profile.getUser().getRole() : "student")
                .gender(profile.getGender())
                .age(profile.getAge())
                .collegeName(profile.getCollege() != null ? profile.getCollege().getName() : "UniSphere College")
                .majorCourse(profile.getMajorCourse())
                .academicYear(profile.getAcademicYear())
                .currentSemester(profile.getCurrentSemester())
                .avatarUrl(profile.getAvatarUrl())
                .bio(profile.getBio())
                .hometownDistrict(profile.getHometownDistrict())
                .currentCity(profile.getCurrentCity())
                .preferredRelocationCity(profile.getPreferredRelocationCity())
                .budgetMin(profile.getBudgetMin())
                .budgetMax(profile.getBudgetMax())
                .verificationStatus(profile.getVerificationStatus())
                .completenessPercentage(90)
                .interests(profile.getInterests())
                .skills(profile.getSkills())
                .languages(profile.getLanguages())
                .build();
    }
}
