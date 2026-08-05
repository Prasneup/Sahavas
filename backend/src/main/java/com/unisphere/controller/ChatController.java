package com.unisphere.controller;

import com.unisphere.dto.ChatPayload;
import com.unisphere.dto.ProfileResponse;
import com.unisphere.model.Conversation;
import com.unisphere.model.Message;
import com.unisphere.model.StudentProfile;
import com.unisphere.model.User;
import com.unisphere.repository.ConversationRepository;
import com.unisphere.repository.MessageRepository;
import com.unisphere.repository.StudentProfileRepository;
import com.unisphere.repository.UserRepository;
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
    private final SimpMessagingTemplate messagingTemplate;

    // Direct Conversation List DTO
    @Data
    @Builder
    public static class ConversationResponse {
        private UUID conversationId;
        private ProfileResponse peerProfile;
        private String lastMessage;
        private String lastMessageTime;
        private long unreadCount;
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

            return ConversationResponse.builder()
                    .conversationId(c.getId())
                    .peerProfile(peerProfile)
                    .lastMessage(lastMsg)
                    .lastMessageTime(lastMsgTime)
                    .unreadCount(unread)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID conversationId) {

        List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        
        // Mark all incoming messages as read
        UUID userId = principal.getId();
        msgs.stream()
            .filter(m -> !m.getSenderId().equals(userId) && !m.isRead())
            .forEach(m -> {
                m.setRead(true);
                messageRepository.save(m);
            });

        return ResponseEntity.ok(msgs);
    }

    @PostMapping("/conversations")
    public ResponseEntity<Map<String, Object>> createConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {

        UUID actorId = principal.getId();
        UUID recipientId = UUID.fromString(body.get("recipientUserId"));

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        // Check if conversation already exists
        Optional<Conversation> existingOpt = conversationRepository.findConversationBetweenUsers(actor, recipient);
        Conversation conversation;
        if (existingOpt.isPresent()) {
            conversation = existingOpt.get();
        } else {
            conversation = Conversation.builder()
                    .participants(Arrays.asList(actor, recipient))
                    .build();
            conversationRepository.save(conversation);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("conversationId", conversation.getId());
        return ResponseEntity.ok(res);
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
