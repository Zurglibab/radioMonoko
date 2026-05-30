/**
  * Représente un contenu tel qu'il est stocké dans le cache local.
  * Construit côté client par le hook via le N+1 fetch sur /content/{id}.
  * Le champ "id" est un UUID local généré à la création du content dans le cache,
  * tandis que "api_id" correspond à l'identifiant du contenu dans l'API tierce.
  * Cela permet de gérer les contenus même si l'API tierce change ou supprime des éléments.
 */
export interface ContentDTO {
  id: string;
  api_id: string;
  title: string;
  description: string;
  content_type: string;
  created_at: string;
}

/**
 * Payload de création d'un Content
 */
export interface CreateContentPayload {
  api_id: string;
  title: string;
  description: string;
  content_type: string;
}