import { AppNotification, NotificationType } from "@/types/content";
import { NotificationDTO, NOTIFICATION_TYPES } from "@/types/notification";

/**
 * Normalise le `type` freeform du backend vers le type strict de l'UI.
 * Tout type inconnu retombe sur 'recommendation' (icône générique).
 */
const normalizeType = (rawType: string): NotificationType => {
  const t = rawType?.toLowerCase() as NotificationType;
  return NOTIFICATION_TYPES.includes(t) ? t : 'recommendation';
};

/**
 * Dérive un titre lisible à partir du type, le backend n'en fournissant pas.
 */
const deriveTitle = (type: NotificationType): string => {
  switch (type) {
    case 'like': return "Nouveau J'aime";
    case 'comment': return 'Nouveau commentaire';
    case 'follow': return 'Nouvel abonné';
    case 'recommendation': return 'Recommandation';
    default: return 'Notification';
  }
};

/**
 * mapNotificationDtoToApp : Convertit le DTO backend vers le modèle UI AppNotification.
 */
export const mapNotificationDtoToApp = (dto: NotificationDTO): AppNotification => {
  const type = normalizeType(dto.type);
  return {
    id: dto.id,
    type,
    title: deriveTitle(type),
    message: dto.message,
    timestamp: dto.created_at,
    isRead: dto.is_read,
  };
};