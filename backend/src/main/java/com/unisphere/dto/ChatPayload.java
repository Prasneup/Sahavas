package com.unisphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatPayload {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private UUID recipientId;
    private String content;
    private String type; // CHAT, TYPING, READ
    private String messageType; // TEXT, IMAGE, ROOM_SHARE, PROFILE_SHARE
    private UUID sharedResourceId;
    private String createdAt;
}
