import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import { SocialActivity } from "@/types/community";
import { SocialService } from "@/services/social/social.service";
import { LikeReviewService } from "@/services/reviews/likeReview.service";
import { NotificationService } from "@/services/notifications/notification.service";
import { ReportService } from "@/services/reports/report.service";

export const useActivityActions = (activity: SocialActivity) => {
  const { t } = useTranslation();
  const { token, user } = useAuthContext();

  const [isLiked, setIsLiked] = useState(activity.hasLiked ?? false);
  const [likesCount, setLikesCount] = useState(activity.likes);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (!isLiking) {
      setLikesCount(activity.likes);
      setIsLiked(activity.hasLiked ?? false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.likes, activity.hasLiked]);

  const isOwnPost = activity.userId === user?.id;

  const handleLike = async () => {
    if (!token || !user?.id || isLiking) return;
    setIsLiking(true);
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      if (wasLiked) {
        await LikeReviewService.remove(token, activity.id, user.id);
      } else {
        await LikeReviewService.upsert(token, activity.id, user.id, true);
        if (activity.userId !== user.id) {
          NotificationService.create(token, {
            user_id: activity.userId,
            type: 'like',
            message: t('home.activityCard.likeNotification', {
              username: user.username ?? t('home.activityCard.someone'),
              media: activity.targetMedia,
            }),
            is_read: false,
          }).catch(() => {});
        }
      }
    } catch (err) {
      if (__DEV__) console.warn('[useActivityActions] like failed:', err);
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleFollow = async () => {
    if (!token) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await SocialService.unfollowUser(token, activity.userId);
      } else {
        await SocialService.followUser(token, activity.userId);
      }
    } catch {
      setIsFollowing(wasFollowing);
    }
  };

  const submitReport = async (reasonKey: 'spam' | 'inappropriate') => {
    if (!token || !user?.id) return;
    try {
      await ReportService.reportReview(token, {
        reporter_id: user.id,
        review_id: activity.id,
        report_type: t(`home.activityCard.reportReasons.${reasonKey}`),
      });
      Alert.alert(t('home.activityCard.thanksTitle'), t('home.activityCard.thanksMessage'));
    } catch (err) {
      if (__DEV__) console.warn('[useActivityActions] report failed:', err);
      Alert.alert(t('common.error'), t('home.activityCard.reportError'));
    }
  };

  const handleReport = () => {
    Alert.alert(
      t('home.activityCard.moderationTitle'),
      t('home.activityCard.moderationMessage'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: t('home.activityCard.reportSpam'), onPress: () => submitReport('spam') },
        { text: t('home.activityCard.reportInappropriate'), style: "destructive", onPress: () => submitReport('inappropriate') },
      ]
    );
  };

  return { isLiked, likesCount, isFollowing, isLiking, isOwnPost, handleLike, handleFollow, handleReport };
};
