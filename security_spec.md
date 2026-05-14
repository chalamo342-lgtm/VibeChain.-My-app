# Security Specification: VibeChain

## Data Invariants
1. A video must have a valid `userId` matching the creator's UID.
2. A video `videoURL` must be a valid Firebase Storage URL.
3. Chains are formed by `parentId`. The `parentId` must point to an existing video.
4. Users can only edit or delete their own videos.
5. Likes are unique per user per video.
6. Comments must have a valid `userId` and `videoId`.
7. User profiles can only be updated by the owner of that profile.
8. `followerCount`, `likeCount`, etc., on the User profile should ideally be updated via Cloud Functions or atomicity guarantees, but since we are client-side for now, we'll implement strict validation.

## The "Dirty Dozen" Payloads (Attack Vectors)
1. **Identity Spoofing**: Creating a video with `userId: "target_user_id"`.
2. **Shadow Field Injection**: Adding `isVerified: true` to a user profile update.
3. **Orphaned Writes**: Creating a comment for a non-existent video.
4. **ID Poisoning**: Injecting a 2MB string as a video ID.
5. **Timestamp Fraud**: Providing a future `createdAt` date from the client.
6. **State Skip**: Manually incrementing `likeCount` without actually creating a Like document.
7. **Recursive Drain**: Performing a list query that scans the entire database without filters.
8. **PII Leak**: Reading private user info (if any) as a guest.
9. **Chain Hijack**: Setting `parentId` to a video the user shouldn't be able to continue (though continuing is public).
10. **Global Write**: Attempting to delete a video owned by another user.
11. **Spam Comment**: Creating 1000 comments in a second.
12. **Malicious Metadata**: Injecting script tags into the `caption` field.

## Security Rules Strategy
- Use `isValidUser()`, `isValidVideo()`, `isValidComment()` helpers.
- Enforce `request.auth.uid` equality for all ownership fields.
- Enforce `request.time` for all timestamps.
- Use `exists()` to verify relational consistency.
