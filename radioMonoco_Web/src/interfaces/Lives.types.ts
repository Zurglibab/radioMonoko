export interface LiveTrack {
    id: string;
    title: string;
    albumTitle?: string;
    discNumber?: number;
    trackNumber?: number;
}

export interface LiveSong {
    id: string;
    start: number;
    end: number;
    track: LiveTrack;
}

export interface LiveShow {
    title: string;
    lead?: string;
    hosts?: string[];
}

export interface LiveProgram {
    title: string;
    description?: string;
}

export interface LiveInfo {
    show: LiveShow | null;
    program: LiveProgram | null;
    song: LiveSong | null;
}

export interface LiveResponse {
    live: LiveInfo;
}