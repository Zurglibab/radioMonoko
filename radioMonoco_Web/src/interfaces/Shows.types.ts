export interface PersonNode {
    id: string;
    name: string;
}

export interface PersonalitiesEdge {
    relation: "producer" | "staff" | "guest" | "tag" | string;
    info: "realisation" | "animation" | "" | string;
    node: PersonNode;
}

export interface PersonalitiesConnection {
    edges: PersonalitiesEdge[];
}

export interface DiffusionNode {
    title: string;
    url: string;
    personalitiesConnection: PersonalitiesConnection;
}

export interface DiffusionsEdge {
    node: DiffusionNode;
}

export interface DiffusionsConnection {
    edges: DiffusionsEdge[];
}

export interface ShowNode {
    id: string;
    title: string;
    diffusionsConnection: DiffusionsConnection;
}

export interface ShowEdge {
    cursor: string;
    node: ShowNode;
}

export interface ShowsConnection {
    edges: ShowEdge[];
}

export interface ShowsDataResponse {
    shows: ShowsConnection;
}