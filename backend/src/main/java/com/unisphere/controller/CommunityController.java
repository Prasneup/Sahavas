package com.unisphere.controller;

import com.unisphere.model.*;
import com.unisphere.repository.*;
import com.unisphere.security.UserPrincipal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityRepository communityRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final PollOptionRepository pollOptionRepository;
    private final EventDetailRepository eventDetailRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    // Response DTOs
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostResponse {
        private UUID id;
        private UUID communityId;
        private UUID authorId;
        private String authorName;
        private String authorAvatar;
        private String authorVerification;
        private String title;
        private String content;
        private String postType;
        private long likesCount;
        private long commentsCount;
        private boolean likedByMe;
        private OffsetDateTime createdAt;
        private List<PollOptionResponse> pollOptions;
        private EventDetailResponse eventDetails;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PollOptionResponse {
        private UUID id;
        private String optionText;
        private int votesCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventDetailResponse {
        private OffsetDateTime eventDate;
        private String location;
        private int rsvpsCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePostRequest {
        private String title;
        private String content;
        private String postType; // TEXT, POLL, EVENT
        private List<String> pollOptions;
        private String eventDate;
        private String location;
    }

    @GetMapping
    public ResponseEntity<List<Community>> getCommunities() {
        List<Community> list = communityRepository.findAll();
        if (list.isEmpty()) {
            // Seed default communities
            Community c1 = Community.builder()
                    .name("Pulchowk Campus Hub")
                    .description("Official discussion forum for Pulchowk Engineering Campus, Lalitpur.")
                    .type(Community.CommunityType.COLLEGE)
                    .build();
            Community c2 = Community.builder()
                    .name("Kaski District Union")
                    .description("Student union forum for all residents relocating from Pokhara/Kaski.")
                    .type(Community.CommunityType.DISTRICT)
                    .build();
            Community c3 = Community.builder()
                    .name("BBA Students Network")
                    .description("Academic support and housing listings for BBA students across Nepal.")
                    .type(Community.CommunityType.COURSE)
                    .build();

            communityRepository.saveAll(Arrays.asList(c1, c2, c3));
            list = communityRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<PostResponse>> getPosts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID communityId) {

        UUID userId = principal.getId();
        List<Post> posts = postRepository.findByCommunityIdOrderByCreatedAtDesc(communityId);

        List<PostResponse> responses = posts.stream().map(post -> {
            StudentProfile profile = studentProfileRepository.findById(post.getAuthor().getId()).orElse(null);
            String name = profile != null ? profile.getFullName() : "Anonymous User";
            String avatar = profile != null ? profile.getAvatarUrl() : "";
            String verState = profile != null ? profile.getVerificationStatus().toString() : "UNVERIFIED";

            long likes = postLikeRepository.countByPostId(post.getId());
            long comments = commentRepository.countByPostId(post.getId());
            boolean liked = postLikeRepository.findByPostIdAndUserId(post.getId(), userId).isPresent();

            List<PollOptionResponse> pollOpts = null;
            if (post.getPostType() == Post.PostType.POLL) {
                pollOpts = pollOptionRepository.findByPostId(post.getId()).stream()
                        .map(o -> PollOptionResponse.builder()
                                .id(o.getId())
                                .optionText(o.getOptionText())
                                .votesCount(o.getVotesCount())
                                .build())
                        .collect(Collectors.toList());
            }

            EventDetailResponse evDetails = null;
            if (post.getPostType() == Post.PostType.EVENT) {
                EventDetail ed = eventDetailRepository.findById(post.getId()).orElse(null);
                if (ed != null) {
                    evDetails = EventDetailResponse.builder()
                            .eventDate(ed.getEventDate())
                            .location(ed.getLocation())
                            .rsvpsCount(ed.getRsvpsCount())
                            .build();
                }
            }

            return PostResponse.builder()
                    .id(post.getId())
                    .communityId(post.getCommunityId())
                    .authorId(post.getAuthor().getId())
                    .authorName(name)
                    .authorAvatar(avatar)
                    .authorVerification(verState)
                    .title(post.getTitle())
                    .content(post.getContent())
                    .postType(post.getPostType().toString())
                    .likesCount(likes)
                    .commentsCount(comments)
                    .likedByMe(liked)
                    .createdAt(post.getCreatedAt())
                    .pollOptions(pollOpts)
                    .eventDetails(evDetails)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/posts")
    public ResponseEntity<Post> createPost(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID communityId,
            @RequestBody CreatePostRequest request) {

        User author = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post.PostType type = Post.PostType.valueOf(request.getPostType().toUpperCase());

        Post post = Post.builder()
                .communityId(communityId)
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .postType(type)
                .build();

        postRepository.save(post);

        // If it's a POLL, create options
        if (type == Post.PostType.POLL && request.getPollOptions() != null) {
            for (String optText : request.getPollOptions()) {
                if (optText != null && !optText.isBlank()) {
                    PollOption opt = PollOption.builder()
                            .postId(post.getId())
                            .optionText(optText)
                            .build();
                    pollOptionRepository.save(opt);
                }
            }
        }

        // If it's an EVENT, create details
        if (type == Post.PostType.EVENT && request.getEventDate() != null) {
            EventDetail ed = EventDetail.builder()
                    .postId(post.getId())
                    .eventDate(OffsetDateTime.parse(request.getEventDate()))
                    .location(request.getLocation() != null ? request.getLocation() : "Kathmandu")
                    .build();
            eventDetailRepository.save(ed);
        }

        return ResponseEntity.ok(post);
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID postId) {

        UUID userId = principal.getId();
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUserId(postId, userId);
        boolean liked;
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            liked = false;
        } else {
            PostLike pl = PostLike.builder()
                    .postId(postId)
                    .userId(userId)
                    .build();
            postLikeRepository.save(pl);
            liked = true;
        }

        long count = postLikeRepository.countByPostId(postId);
        Map<String, Object> res = new HashMap<>();
        res.put("liked", liked);
        res.put("likesCount", count);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<Comment> addComment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID postId,
            @RequestBody Map<String, String> body) {

        User author = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Comment comment = Comment.builder()
                .postId(postId)
                .author(author)
                .content(body.get("content"))
                .build();

        commentRepository.save(comment);
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable("id") UUID postId) {
        List<Comment> list = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/posts/polls/options/{optionId}/vote")
    public ResponseEntity<Map<String, Object>> votePoll(@PathVariable("optionId") UUID optionId) {
        PollOption opt = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new IllegalArgumentException("Option not found"));

        opt.setVotesCount(opt.getVotesCount() + 1);
        pollOptionRepository.save(opt);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("votesCount", opt.getVotesCount());
        return ResponseEntity.ok(res);
    }
}
